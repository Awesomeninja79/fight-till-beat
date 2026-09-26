# Privacy and data protection plan

## Data map for v1

| Flow | Intended behavior | Evidence to collect |
| --- | --- | --- |
| Browser requests | Static files delivered by Vercel; provider processes network/security metadata that may include IP addresses | Provider settings, terms, DPA where needed, retention/access notes |
| Local preferences | Music/effects volume, mute, quality, reduced-motion/flash preferences only; no unique ID | Browser storage audit and reset control; current key is `ftb-settings-v1` |
| Accounts and scores | None saved server-side | Network and code audit |
| Analytics, ads, third-party embeds | None at launch | Network inventory showing no trackers |
| Browser sensors | No camera, microphone, geolocation, contacts | Browser permission audit |
| Support email | Voluntary messages to operator | Contact mailbox access and deletion policy |

The app will not claim “no data is collected.” Vercel describes request and IP-related processing; the operator must explain the actual configuration and purposes in a public privacy notice. The EU GDPR principles include purpose limitation, minimization, storage limitation, security, and transparency. [European Commission](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en), [Vercel notice](https://vercel.com/legal/privacy-notice).

## Controls and documentation

- The individual operator is Neeraj Saini; launch is intended worldwide. A business contact address is pending, and no personal email should be published. Before launch, identify the contact, hosting account, processor relationship, log/retention settings, and where data may be handled. Draft the privacy notice from the observed production network/storage audit, not from assumptions.
- The Vercel project-level option to improve models with this project's code/chat data was turned off during setup. Confirm the saved setting during release review; this does not replace the public privacy notice.
- Do not set a tracking cookie or persistent identifier. If local preferences persist, say what keys exist and provide Reset Preferences. Do not put personal data in URL query strings.
- Keep analytics off by default. If later enabled, document vendor, events, data fields, purpose, legal basis or consent requirement, retention, and withdrawal process before shipping. “Cookie-free” alone does not settle all privacy obligations.
- Limit access to hosting dashboards and support email. Define a process to answer access/deletion requests applicable to the actual data held by the operator.
- If the game targets children or the operator has actual knowledge of personal data from children, obtain region-specific legal review before release. U.S. COPPA can apply to child-directed services. [FTC guidance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions).
- Revisit this document before introducing uploads, accounts, payments, social sharing, analytics, AI APIs, or a large catalog admin service.

## Privacy gate

No release until an operator-approved notice and contact are live, dashboard settings and retention are documented, the deployed Network/Storage panels match the data map, and any applicable regional review has been completed. Exact legal language remains an owner/counsel decision.
