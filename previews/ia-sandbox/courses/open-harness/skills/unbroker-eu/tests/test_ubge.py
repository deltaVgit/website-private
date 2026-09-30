#!/usr/bin/env python3
"""Hermetic tests for unbroker-eu — no network."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UBGE = ROOT / "scripts" / "ubge.py"


class UbgeEuTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.env = os.environ.copy()
        self.env["UNBROKER_DATA_DIR"] = self.tmp.name
        self.env.pop("UBGE_DATA_DIR", None)
        self.env.pop("HERMES_HOME", None)

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def run_ubge(self, *args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(UBGE), *args],
            env=self.env,
            text=True,
            capture_output=True,
            check=check,
        )

    def intake(self) -> str:
        out = self.run_ubge(
            "intake",
            "--full-name",
            "Alex Müller",
            "--email",
            "alex@example.eu",
            "--street",
            "Rue de la Loi 1",
            "--country",
            "BE",
            "--consent",
        )
        return json.loads(out.stdout)["subject_id"]

    def test_intake_refuses_without_consent(self) -> None:
        proc = self.run_ubge(
            "intake",
            "--full-name",
            "Alex Müller",
            "--email",
            "alex@example.eu",
            check=False,
        )
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("no consent", proc.stderr)

    def test_doctor_is_gdpr(self) -> None:
        doc = json.loads(self.run_ubge("doctor").stdout)
        self.assertEqual(doc["legal_kind"], "gdpr")
        self.assertIn("youronlinechoices", doc["noid"])
        self.assertIn("schufa", doc["id_gated"])

    def test_next_starts_with_youronlinechoices(self) -> None:
        sid = self.intake()
        nxt = json.loads(self.run_ubge("next", sid).stdout)
        self.assertEqual(nxt["legal_kind"], "gdpr")
        self.assertEqual(nxt["actions"][0]["target"], "youronlinechoices")
        self.assertEqual(nxt["actions"][0]["type"], "one_shot_submit")
        blob = json.dumps(nxt).lower()
        self.assertNotIn("ccpa", blob)
        self.assertNotIn("robinson", blob)
        digest_ids = {d["target"] for d in nxt["human_digest"]}
        self.assertTrue({"schufa", "experian", "crif_eu"} <= digest_ids)

    def test_letter_is_gdpr_not_fadp(self) -> None:
        sid = self.intake()
        letter = json.loads(self.run_ubge("letter", sid, "criteo").stdout)
        self.assertEqual(letter["to"], "dpo@criteo.com")
        self.assertIn("Article 17", letter["body"])
        self.assertIn("Article 21", letter["body"])
        self.assertNotIn("nLPD", letter["body"])
        self.assertNotIn("CCPA", letter["body"])
        proc = self.run_ubge("letter", sid, "schufa", check=False)
        self.assertNotEqual(proc.returncode, 0)

    def test_id_gated_cannot_submit(self) -> None:
        sid = self.intake()
        proc = self.run_ubge("record", sid, "experian", "submitted", check=False)
        self.assertNotEqual(proc.returncode, 0)

    def test_dnb_skips_when_not_found(self) -> None:
        sid = self.intake()
        self.run_ubge("record", sid, "dnb", "not_found", "--found", "false")
        nxt = json.loads(self.run_ubge("next", sid).stdout)
        self.assertFalse(any(a["target"] == "dnb" for a in nxt["actions"]))

    def test_queue_drains(self) -> None:
        sid = self.intake()
        catalog = json.loads((ROOT / "scripts" / "targets.json").read_text(encoding="utf-8"))
        for tid, spec in catalog["targets"].items():
            if spec["lane"] != "noid":
                continue
            if spec.get("scan"):
                self.run_ubge("record", sid, tid, "not_found", "--found", "false")
            if spec.get("blind_optout"):
                self.run_ubge("record", sid, tid, "submitted")
        nxt = json.loads(self.run_ubge("next", sid).stdout)
        self.assertTrue(nxt["done_for_now"])
        self.assertEqual(nxt["actions"], [])


if __name__ == "__main__":
    unittest.main()
