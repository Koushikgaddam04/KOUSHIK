# Software Requirements Specification (SRS)
## Project: Health Insurance Management System (HIMS)

**Author:** Koushik Gaddam  
**Version:** 1.0  
**Date:** March 12, 2026

---

## 1. Introduction
### 1.1 Purpose
The purpose of this document is to provide a detailed overview of the Software Requirements for the Health Insurance Management System (HIMS). It outlines the functional and non-functional requirements, the system architecture, and the workflow of the application.

### 1.2 Scope
HIMS is a comprehensive digital platform designed to automate and streamline the health insurance lifecycle. This includes policy creation, customer enrollment, commission management for agents, medical claim processing, and administrative oversight. The system connects four primary stakeholders: Customers, Agents, Claims Officers, and Administrators.

---

## 2. System Overview
The system follows a modern multi-tier architecture:
- **Frontend:** Built with Angular (Single Page Application) for a responsive and dynamic user experience.
- **Backend:** Built with ASP.NET Core (C#) using Clean Architecture principles (Domain, Infrastructure, Application, API).
- **Database:** Relational Database (SQL Server) managed via Entity Framework Core.
- **Security:** JWT-based Authentication and Role-Based Access Control (RBAC).

---

## 3. Product Features (Module-wise)

### 3.1 Authentication & Profile Module
- **User Registration:** Secure self-registration for Customers.
- **Internal Staff Management:** Admin-only creation of Agents and Claims Officers.
- **Role-Based Login:** Secure JWT authentication that redirects users to their respective dashboards based on roles.
- **Profile Management:** Users can update their personal details and document vault.

### 3.2 Policy & Plan Module
- **Plan Discovery:** Customers can browse available insurance plans (Life, Health, etc.).
- **Premium Calculation:** Automated quoting engine based on plan parameters.
- **Policy Enrollment:** Seamless application process for new policies.
- **Commission Management:** Automatic tracking of commissions earned by Agents for successful policy sales.

### 3.3 Document Verification Module
- **Document Vault:** Secure storage for identity proof and medical records.
- **Multi-Level Approval:** Verification of uploaded documents by Agents and Admins.
- **Inline Preview:** Integrated document viewer for quick verification without downloads.

### 3.4 Claims Processing Module
- **Claim Submission:** Customers can file medical claims against active policies.
- **Review Workflow:** Claims Officers analyze medical documents and approve/reject claims.
- **Status Tracking:** Real-time updates for customers on their claim progress.

### 3.5 Administrative Oversight
- **System Dashboard:** High-level metrics for total users, active policies, and total claims.
- **Action Logs:** Detailed audit trail of all staff activities in the system.
- **Staff Management:** Ability to manage (add/update) internal employees.

---

## 4. User Roles & Workflow

| Role | Key Responsibilities |
| :--- | :--- |
| **Customer** | Browser plans, apply for policies, pay premiums, and file claims. |
| **Agent** | Target leads, verify customer documents, and manage policy activations. |
| **Claims Officer** | Audit medical reports, verify claim legitimacy, and process settlements. |
| **Administrator** | Manage the platform, monitor logs, and manage internal staff. |

### 4.1 Core Lifecycle Workflow
1. **Initiation:** Customer registers and chooses an insurance plan.
2. **Verification:** Agent reviews the application and verifies the documents in the vault.
3. **Activation:** Upon approval, the policy becomes "Active" and a policy number is generated.
4. **Maintenance:** Customer pays premiums; Agent tracks commissions.
5. **Settlement:** In case of medical events, Customer files a claim. Claims Officer reviews medical proof and approves the payout.

---

## 5. Non-Functional Requirements
- **Security:** Sensitive data encryption and secure JWT tokens.
- **Scalability:** Built on .NET Core for high performance and horizontal scaling.
- **Usability:** Responsive design compatible with desktops, tablets, and phones.
- **Reliability:** Comprehensive logging for audit trails and error recovery.

---

## 6. Technology Stack
- **Frontend Framework:** Angular 17+
- **Backend Framework:** ASP.NET Core 8.0 Web API
- **ORM:** Entity Framework Core
- **Database:** Microsoft SQL Server
- **Language:** C# (Backend), TypeScript (Frontend)
- **Styling:** CSS3, Bootstrap/Tailwind
- **Version Control:** Git & GitHub (with LFS for large media)
