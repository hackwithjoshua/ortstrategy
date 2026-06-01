import LegalPage from './LegalPage'

export default function TermsOfService() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="June 1, 2026">
      <div className="highlight-box">
        <p>
          <strong>Please read these Terms carefully.</strong> By engaging Ort Strategy Tech Services
          for any of our services — including consulting, development, staffing, or any other offering —
          you agree to be bound by these Terms of Service.
        </p>
      </div>

      <h2>1. Acceptance of Terms</h2>
      <p>
        These Terms of Service ("Terms") govern your use of the services provided by Ort Strategy Tech Services
        ("Ort Strategy", "we", "us", or "our"). By accessing our website, submitting an enquiry, signing a
        Statement of Work, or using any of our services, you ("Client", "you") agree to these Terms.
      </p>
      <p>
        If you are entering into these Terms on behalf of a company or organisation, you represent that
        you have the authority to bind that entity to these Terms.
      </p>

      <h2>2. Services Offered</h2>
      <p>Ort Strategy provides the following categories of services:</p>

      <h3>2.1 Technology Consulting Services</h3>
      <ul>
        <li><strong>DevOps Engineering:</strong> CI/CD pipeline design, Kubernetes and container orchestration, Infrastructure as Code (Terraform, Pulumi, OpenTofu, AWS CDK, CloudFormation, Kustomize), cloud cost optimisation, and observability</li>
        <li><strong>System Design:</strong> Distributed system architecture, database design, API design (REST, GraphQL, gRPC), event-driven and microservices patterns, and technical roadmaps</li>
        <li><strong>Security Consultation:</strong> Security architecture review, OWASP threat modelling, SAST/DAST CI integration, compliance frameworks (SOC2, ISO 27001, GDPR), and incident response planning</li>
        <li><strong>Full Stack Development:</strong> Frontend (React, Next.js), backend (Node.js, Python, Go), database design, and API development</li>
        <li><strong>Data Engineering:</strong> ETL/ELT pipelines, data warehouse architecture, stream processing (Kafka, Flink, Spark), ML model training data collection, and IaC training datasets</li>
      </ul>

      <h3>2.2 Engineer Staffing and Outsourcing</h3>
      <ul>
        <li><strong>Part-Time Placement:</strong> Dedicated engineer available 20 hours/week embedded in your team</li>
        <li><strong>Full-Time Placement:</strong> Dedicated engineer available 40 hours/week, timezone-aligned</li>
        <li><strong>Team/Squad:</strong> Multiple engineers forming a dedicated squad with tech lead and project management</li>
      </ul>
      <p>
        Specific deliverables, timelines, and pricing for each engagement are defined in a separate
        Statement of Work (SOW) or service agreement signed by both parties.
      </p>

      <h2>3. Engagement Process</h2>
      <p>All service engagements follow this process:</p>
      <ul>
        <li>Initial enquiry and requirements gathering</li>
        <li>Proposal and Statement of Work presented to Client</li>
        <li>Agreement signed by both parties</li>
        <li>Kickoff and onboarding</li>
        <li>Delivery and review milestones as defined in the SOW</li>
      </ul>
      <p>
        For staffing engagements, a 2-week trial period applies. Either party may terminate the engagement
        during this period with 48 hours written notice and no financial penalty beyond hours worked.
      </p>

      <h2>4. Client Responsibilities</h2>
      <p>The Client agrees to:</p>
      <ul>
        <li>Provide timely access to necessary systems, documentation, and stakeholders</li>
        <li>Designate a primary point of contact for the engagement</li>
        <li>Review and provide feedback on deliverables within agreed timeframes</li>
        <li>Ensure the working environment for placed engineers meets professional standards</li>
        <li>Not solicit or directly hire engineers introduced through our staffing services for a period of 12 months without our written consent and applicable placement fee</li>
        <li>Use our services only for lawful purposes and in compliance with applicable laws</li>
      </ul>

      <h2>5. Fees and Payment</h2>
      <p>
        Fees for all services are as specified in the applicable Statement of Work or service agreement.
        Unless otherwise stated:
      </p>
      <ul>
        <li>Consulting and development services are invoiced monthly or at agreed milestones</li>
        <li>Staffing engagements are invoiced monthly in advance</li>
        <li>Invoices are due within 14 days of issue</li>
        <li>Late payments accrue interest at 2% per month on the outstanding balance</li>
        <li>All fees are exclusive of applicable taxes (VAT, GST, etc.) unless stated otherwise</li>
      </ul>
      <p>
        We reserve the right to pause or terminate services for accounts with overdue invoices
        exceeding 30 days past the due date.
      </p>

      <h2>6. Intellectual Property</h2>

      <h3>6.1 Client-Owned Work Product</h3>
      <p>
        Upon receipt of full payment, all custom deliverables created specifically for the Client
        under a Statement of Work — including code, designs, and documentation — become the sole
        property of the Client. Ort Strategy retains no rights to such work product.
      </p>

      <h3>6.2 Pre-Existing IP and Tools</h3>
      <p>
        Ort Strategy retains ownership of all pre-existing intellectual property, internal tools,
        frameworks, methodologies, and know-how. Where pre-existing IP is incorporated into
        deliverables, Ort Strategy grants the Client a perpetual, non-exclusive licence to use it
        solely in connection with the delivered work.
      </p>

      <h3>6.3 Open Source</h3>
      <p>
        We may incorporate open-source software in our deliverables. Such software remains subject
        to its respective open-source licences, which will be disclosed to the Client.
      </p>

      <h2>7. Confidentiality</h2>
      <p>
        Both parties agree to keep confidential all non-public information disclosed during the engagement,
        including but not limited to business plans, technical architecture, financial data, client lists,
        and proprietary processes ("Confidential Information").
      </p>
      <p>
        Confidential Information shall not be disclosed to third parties without the disclosing party's
        prior written consent, except as required by law. This obligation survives termination of the
        engagement for a period of 3 years.
      </p>
      <p>
        For staffing engagements, all placed engineers are bound by confidentiality agreements with
        Ort Strategy prior to any client introduction.
      </p>

      <h2>8. Warranties and Representations</h2>
      <p>Ort Strategy warrants that:</p>
      <ul>
        <li>Services will be performed in a professional and workmanlike manner</li>
        <li>We have the right to provide the services and grant the licences described herein</li>
        <li>Engineers introduced for staffing have been screened for technical competency and professional conduct</li>
        <li>To our knowledge, deliverables will not infringe the intellectual property rights of any third party</li>
      </ul>
      <p>
        We do not warrant that services will be error-free or uninterrupted, or that results will meet
        any specific business outcome unless expressly committed to in a Statement of Work.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, Ort Strategy's total liability for any claim
        arising from these Terms or our services shall not exceed the total fees paid by the Client in the
        3 months immediately preceding the event giving rise to the claim.
      </p>
      <p>
        In no event shall Ort Strategy be liable for indirect, incidental, special, consequential, or
        punitive damages, including loss of revenue, loss of profits, loss of data, or business interruption,
        even if advised of the possibility of such damages.
      </p>

      <h2>10. Termination</h2>
      <p>
        Either party may terminate an engagement by providing 30 days written notice, unless a shorter
        or longer notice period is specified in the applicable Statement of Work.
      </p>
      <p>
        Ort Strategy may terminate immediately if the Client breaches these Terms, fails to make payment,
        or engages in conduct that is unlawful or harmful to our engineers or reputation.
      </p>
      <p>
        Upon termination, the Client shall pay for all work completed up to the termination date. Sections
        on Confidentiality, Intellectual Property, Limitation of Liability, and Governing Law survive termination.
      </p>

      <h2>11. Independent Contractor</h2>
      <p>
        Ort Strategy and its engineers operate as independent contractors, not employees, agents, or partners
        of the Client. Nothing in these Terms creates any employment, joint venture, or partnership relationship.
        Ort Strategy is solely responsible for all taxes, benefits, and insurance for its personnel.
      </p>

      <h2>12. Non-Solicitation</h2>
      <p>
        During any active engagement and for 12 months following its conclusion, the Client agrees not to
        directly solicit, recruit, or employ any Ort Strategy engineer introduced through our staffing services,
        without our prior written consent. A placement fee equivalent to 20% of the engineer's annual salary
        applies if this clause is breached.
      </p>

      <h2>13. Governing Law and Dispute Resolution</h2>
      <p>
        These Terms shall be governed by and construed in accordance with applicable law. Any disputes
        arising from these Terms shall first be subject to good-faith negotiation between the parties.
        If unresolved within 30 days, disputes shall be referred to binding arbitration.
      </p>

      <h2>14. Changes to These Terms</h2>
      <p>
        We reserve the right to update these Terms at any time. We will notify existing clients of material
        changes with at least 30 days notice. Continued use of our services following notice constitutes
        acceptance of the updated Terms.
      </p>

      <h2>15. Contact</h2>
      <p>For questions about these Terms of Service:</p>
      <ul>
        <li>Email: <a href="mailto:termsofservices@ortstrategy.com">termsofservices@ortstrategy.com</a></li>
        <li>Staffing enquiries: <a href="mailto:hireengineers@ortstrategy.com">hireengineers@ortstrategy.com</a></li>
        <li>Website: <a href="https://ortstrategy.com">ortstrategy.com</a></li>
      </ul>
    </LegalPage>
  )
}
