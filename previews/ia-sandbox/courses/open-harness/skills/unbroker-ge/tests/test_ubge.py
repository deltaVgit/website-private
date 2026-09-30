#!/usr/bin/env python3
"""Hermetic tests — no network."""

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


class UbgeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.env = os.environ.copy()
        self.env["UBGE_DATA_DIR"] = self.tmp.name
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

    def intake(self, **extra: str) -> str:
        args = [
            "intake",
            "--full-name",
            "Marie Dupont",
            "--email",
            "marie@example.ch",
            "--street",
            "Rue du Stand 1",
            "--npa",
            "1204",
            "--commune",
            "Genève",
            "--consent",
        ]
        for k, v in extra.items():
            args.extend([k, v])
        out = self.run_ubge(*args)
        return json.loads(out.stdout)["subject_id"]

    def test_intake_refuses_without_consent(self) -> None:
        proc = self.run_ubge(
            "intake",
            "--full-name",
            "Marie Dupont",
            "--email",
            "marie@example.ch",
            check=False,
        )
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("no consent", proc.stderr)

    def test_doctor_and_setup(self) -> None:
        self.run_ubge("setup")
        doc = json.loads(self.run_ubge("doctor").stdout)
        self.assertTrue(doc["setup"])
        self.assertEqual(doc["legal_kind"], "fadp")
        self.assertIn("robinson", doc["noid"])
        self.assertIn("crif", doc["id_gated"])

    def test_next_orders_robinson_first_then_scans(self) -> None:
        sid = self.intake()
        nxt = json.loads(self.run_ubge("next", sid).stdout)
        types = [a["type"] for a in nxt["actions"]]
        targets = [a["target"] for a in nxt["actions"]]
        self.assertEqual(nxt["legal_kind"], "fadp")
        self.assertFalse(nxt["done_for_now"])
        self.assertEqual(targets[0], "robinson")
        self.assertEqual(types[0], "robinson_submit")
        self.assertIn("localsearch", targets)
        self.assertIn("scan", types)
        digest_ids = {d["target"] for d in nxt["human_digest"]}
        self.assertTrue({"crif", "az_direct", "creditreform"} <= digest_ids)
        self.assertNotIn("ccpa", json.dumps(nxt).lower())

    def test_email_targets_draft_do_not_send(self) -> None:
        sid = self.intake()
        nxt = json.loads(self.run_ubge("next", sid).stdout)
        mail = [a for a in nxt["actions"] if a["target"] == "moneyhouse"]
        # moneyhouse is scan-first while unscanned; after not_found it must draft.
        self.run_ubge("record", sid, "moneyhouse", "not_found", "--found", "false")
        nxt = json.loads(self.run_ubge("next", sid).stdout)
        mail = [a for a in nxt["actions"] if a["target"] == "moneyhouse"]
        self.assertEqual(len(mail), 1)
        self.assertEqual(mail[0]["type"], "draft_letter")
        self.assertIn("human_task_queued", mail[0]["after"])
        self.assertNotEqual(mail[0]["type"], "optout_email")

    def test_blind_optout_after_not_found(self) -> None:
        sid = self.intake()
        self.run_ubge("record", sid, "localsearch", "not_found", "--found", "false")
        nxt = json.loads(self.run_ubge("next", sid).stdout)
        loc = [a for a in nxt["actions"] if a["target"] == "localsearch"]
        self.assertEqual(len(loc), 1)
        self.assertEqual(loc[0]["type"], "optout_web_form")

    def test_dnb_skips_optout_when_not_found(self) -> None:
        sid = self.intake()
        self.run_ubge("record", sid, "dnb", "not_found", "--found", "false")
        nxt = json.loads(self.run_ubge("next", sid).stdout)
        self.assertFalse(any(a["target"] == "dnb" for a in nxt["actions"]))

    def test_id_gated_cannot_be_marked_submitted(self) -> None:
        sid = self.intake()
        proc = self.run_ubge("record", sid, "crif", "submitted", check=False)
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("ID-gated", proc.stderr)

    def test_letter_is_french_fadp_not_ccpa(self) -> None:
        sid = self.intake()
        letter = json.loads(self.run_ubge("letter", sid, "moneyhouse").stdout)
        self.assertEqual(letter["to"], "contact@moneyhouse.ch")
        self.assertIn("nLPD", letter["body"])
        self.assertNotIn("CCPA", letter["body"])
        self.assertNotIn("Article 17", letter["body"])
        proc = self.run_ubge("letter", sid, "crif", check=False)
        self.assertNotEqual(proc.returncode, 0)

    def test_queue_drains_to_done(self) -> None:
        sid = self.intake()
        catalog = json.loads((ROOT / "scripts" / "targets.json").read_text(encoding="utf-8"))
        for tid, spec in catalog["targets"].items():
            if spec["lane"] != "noid":
                continue
            if spec.get("scan"):
                self.run_ubge("record", sid, tid, "not_found", "--found", "false")
            if spec.get("blind_optout") or tid == "dnb":
                if tid == "dnb":
                    continue
                self.run_ubge("record", sid, tid, "submitted")
        nxt = json.loads(self.run_ubge("next", sid).stdout)
        self.assertTrue(nxt["done_for_now"])
        self.assertEqual(nxt["actions"], [])

    def test_status_receipt_has_no_name_in_subject_id(self) -> None:
        sid = self.intake()
        self.assertTrue(sid.startswith("s_"))
        self.assertNotIn("marie", sid.lower())
        status = self.run_ubge("status", sid).stdout.lower()
        self.assertIn("consent: recorded", status)
        self.assertIn("nlpd", status)


if __name__ == "__main__":
    unittest.main()
