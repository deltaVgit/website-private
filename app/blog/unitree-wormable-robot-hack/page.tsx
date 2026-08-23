import BlogPostLayout from '@/components/BlogPostLayout';
import { UnitreeChainFigure } from '../_figures/unitree-chain';
import { UnitreeTimelineFigure } from '../_figures/unitree-timeline';
import { UnitreeWormFigure } from '../_figures/unitree-worm';

export default function UnitreeWormablePost() {
  return (
    <BlogPostLayout
      title="Wormable Robot Hack Turns a Lone Bug into a Fleet-Wide Breach"
      date="August 21, 2026"
      category="OpSec"
      type="Deep Dive"
      excerpt="A Wi-Fi setup button, hardcoded keys, and one string: 'unitree'. The UniPwn bug chain hands root on Unitree robots to anyone in BLE range — and infected robots can propagate the breach robot-to-robot. From a researcher's notebook to the FCC Covered List in ten months."
      readingTime="7 min"
      sourceUrl="https://nvd.nist.gov/vuln/detail/CVE-2025-35027"
      sourceLabel="NVD · CVE-2025-35027"
    >
      <h2>The thing that made me write this</h2>
      <p>
        A single tweet from security researcher Lukasz Olejnik earlier this week summed up a story I&apos;ve been watching since last September: <em>&ldquo;One compromised robot could infect other vulnerable robots nearby, turning a single breach into a wide compromise. Could attackers then take control of entire fleets?&rdquo;</em>
      </p>
      <p>
        That&apos;s not a hypothetical. It&apos;s a documented capability in commercial robots you can buy today — and it&apos;s already escalated from a researcher&apos;s notebook to a national security supply-chain decision. Here&apos;s what happened, in plain terms, and what it means for anyone running connected machines with legs.
      </p>

      <h2>The flaw: one Wi-Fi setup button handed over the whole robot</h2>
      <p>
        In September 2025, security researchers Andreas Makris and Kevin Finisterre disclosed a vulnerability they named <strong>UniPwn</strong> (tracked as <strong>CVE-2025-35027</strong>, rated 7.3 High). It affects several of Unitree&apos;s commercially available robots — the Go2 and B2 quadrupeds, and the G1 and H1 humanoids.
      </p>
      <p>
        The attack went through an innocuous feature: the Bluetooth Low Energy (BLE) channel the robots use to let you configure Wi-Fi during setup. That provisioning service was, in effect, the front door to administrative access. The chain of mistakes that made it exploitable is almost textbook:
      </p>
      <ul>
        <li><strong>Hardcoded crypto keys.</strong> Every affected device shipped with the same AES key and IV, baked into the firmware.</li>
        <li><strong>Trivial authentication.</strong> The &ldquo;handshake&rdquo; essentially just checked that you sent the string <code>unitree</code> encrypted with that known key.</li>
        <li><strong>Command injection.</strong> The Wi-Fi SSID and password fields were passed, unsanitized, into shell commands running with root privileges.</li>
      </ul>
      <p>
        String those together and a nearby attacker on the wireless network doesn&apos;t just get in — they get <strong>root</strong> on the robot. The researchers&apos; proof-of-concept rebooted a robot remotely. The same access would let an attacker implant persistent malware that survives restarts, exfiltrate anything the robot senses or stores, or silently block future firmware updates.
      </p>
      <UnitreeChainFigure />

      <h2>The part that&apos;s actually scary: it&apos;s wormable</h2>
      <p>
        Here&apos;s the detail that pushed this from &ldquo;one vulnerable gadget&rdquo; to &ldquo;fleet problem&rdquo;:
      </p>
      <p>
        Because the compromised device itself carries the exploit, an infected robot can scan for other vulnerable Unitree robots within BLE range and compromise them the same way — autonomously, with no human clicking anything. That&apos;s the definition of <strong>wormable</strong>: a breach that propagates robot-to-robot, capable in principle of becoming a self-replicating botnet of physical machines.
      </p>
      <p>
        A fair caveat, which the researchers and most reporting were careful to include: <em>wormable in the lab is not the same as guaranteed rapid spread in the real world.</em> Whether it actually propagates depends on how the robots are configured, how the network is segmented, firmware diversity, physical proximity, and how fast operators patch. But &ldquo;unlikely to go pandemic tomorrow&rdquo; is cold comfort when the capability is real and the exposure is physical.
      </p>
      <UnitreeWormFigure />

      <h2>Disclosures didn&apos;t stop the story — they widened it</h2>
      <p>
        What makes this worth revisiting now is that September&apos;s disclosure was not the end. Unitree was contacted in May 2025, stopped responding to the researchers in July, and the finding went public in September. Since then, independent teams kept digging into a firmware base the whole product line shares:
      </p>
      <ul>
        <li><strong>UniTEABag (Feb 2026):</strong> the firmware&apos;s encryption was broken, opening up the update and signing process.</li>
        <li><strong>Two more remote-code-execution bugs (Feb 2026):</strong> <strong>CVE-2026-27509</strong> (an unauthenticated DDS-based RCE — the robot&apos;s internal publish-subscribe bus accepts arbitrary Python with no authentication in its default config) and <strong>CVE-2026-27510</strong> (tampering with the companion app&apos;s database to make code run persistently). Unitree pushed OTA patches in firmware V1.1.13 to address the latter.</li>
      </ul>
      <p>
        Then, in <strong>July 2026</strong>, the escalations stopped being only about code. The U.S. <strong>FCC added foreign-produced mobile robots to its Covered List</strong>, explicitly citing these Unitree flaws (CVE-2025-35027/UniPwn and CVE-2025-2894, a separate remote-control bug in the Go1 quadrupeds). The practical effect: new models lose the equipment authorization needed to be imported, marketed, or sold in the U.S.
      </p>
      <p>
        That&apos;s the arc in three acts: a wormable bug → more bugs in the same family → a regulator treating the <em>class of device</em> as a supply-chain risk.
      </p>
      <UnitreeTimelineFigure />

      <h2>The so-what</h2>
      <p>
        For anyone running, buying, or building autonomous machines, this is less a story about one Chinese robot brand and more a lesson about what physical autonomy does to security.
      </p>
      <p>
        <strong>Physical autonomy amplifies ordinary mistakes.</strong> A hardcoded key, a joke of a handshake, and unsanitized input would be a bad day for a Wi-Fi router. Bolted to a robot that moves, senses, and now carries an on-device AI brain, the same three mistakes become something that can take over a physical asset and spread to its neighbors.
      </p>
      <p>
        <strong>&ldquo;Robot security is an IT problem&rdquo; is a dangerous framing.</strong> When an attacker gets root on a robot, they aren&apos;t just reading data — they can change what the robot&apos;s AI <em>sees, decides, and does.</em> That&apos;s not an infrastructure issue; it&apos;s an engineering requirement for anyone deploying physical systems into workplaces, homes, or public space.
      </p>
      <p>
        <strong>If you&apos;re buying AI hardware, you&apos;re buying a software supply chain.</strong> The security of the thing you deploy is the sum of its firmware keys, its update pipeline, its undocumented network services, and a vendor&apos;s willingness to respond to researchers. Procurement ought to be part of the security program.
      </p>

      <h2>The close</h2>
      <p>Practical and grounded, for our readers who own or operate these platforms:</p>
      <ul>
        <li><strong>Patch.</strong> Keep robot firmware current — several of these bugs were addressed via OTA, and old versions remain exposed.</li>
        <li><strong>Segment the network.</strong> Don&apos;t put robots on the same flat network as everything else. BLE provisioning and the internal control bus should both be treated as attack surface.</li>
        <li><strong>Assume proximity is a vector.</strong> &ldquo;An infected robot can reach things in BLE range&rdquo; reframes how you think about what&apos;s physically allowed near a fleet.</li>
        <li><strong>Match the purchase to a security posture.</strong> If you deploy autonomous hardware, review what firmware controls the vendor actually gives you, and what their disclosure record looks like before you buy, not after.</li>
      </ul>
      <p>
        The wormable claim in that tweet wasn&apos;t alarmism — it was a documented feature of the platform, and it&apos;s already influenced policy. Treat connected robots the way you&apos;d treat any internet-connected system with authority over the physical world: as something that will be attacked, and engineer for it from day one.
      </p>

      <p className="text-xs text-[var(--text-muted)] mt-4 pt-3 border-t border-[var(--border-default)]">
        Sources: <a href="https://nvd.nist.gov/vuln/detail/CVE-2025-35027" target="_blank" rel="noopener noreferrer" className="underline">NVD — CVE-2025-35027 (UniPwn)</a> · <a href="https://github.com/Bin4ry/UniPwn" target="_blank" rel="noopener noreferrer" className="underline">UniPwn disclosure (GitHub)</a> · <a href="https://nvd.nist.gov/vuln/detail/CVE-2026-27509" target="_blank" rel="noopener noreferrer" className="underline">NVD — CVE-2026-27509</a> · <a href="https://nvd.nist.gov/vuln/detail/CVE-2026-27510" target="_blank" rel="noopener noreferrer" className="underline">NVD — CVE-2026-27510</a> · <a href="https://www.fcc.gov/document/fcc-adds-foreign-produced-power-inverters-and-robots-covered-list-0" target="_blank" rel="noopener noreferrer" className="underline">FCC — Robots added to Covered List</a> · <a href="https://www.mayerbrown.com/en/insights/publications/2026/07/fcc-adds-foreign-produced-power-inverters-and-advanced-robotic-devices-to-covered-list" target="_blank" rel="noopener noreferrer" className="underline">Mayer Brown analysis</a> · <a href="https://www.techtimes.com/articles/321890/20260728/fcc-bans-chinese-humanoid-robots-power-inverters-linked-confirmed-backdoors.htm" target="_blank" rel="noopener noreferrer" className="underline">TechTimes coverage</a>
      </p>
    </BlogPostLayout>
  );
}