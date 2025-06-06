#  GreenLife Online Insurance System

A comprehensive web-based insurance management platform built with **Next.js 15**, **PostgreSQL**, and **Prisma**. It supports multi-role access, OCR-driven claim processing, and full policy lifecycle management.

## 🚀 Features

### 👥 User Roles
- **Policyholder**: Register, view policies, submit claims, add beneficiaries
- **Agent**: Register policyholders, track business, view commission
- **System Admin**: Process claims, modify/cancel policies, manage applications, generate backups
- **IT Admin**: Manage system users
- **Stakeholder**: View profits and business performance

### 📑 Smart OCR Integration
- Extracts text from uploaded images and PDFs
- Used in claims and application processes
- Supports approval workflows and data generation

### 📦 Other Features
- Secure login with hashed passwords (`bcrypt`)
- Role-based dashboards
- Daily backup and download system
- Fully responsive UI

## ⚙️ Tech Stack
- **Frontend**: Next.js 15 with `app/` directory, TypeScript, Global CSS
- **Backend**: Prisma ORM + PostgreSQL
- **OCR**: OCR.space API (image & PDF support)
- **Storage**: PostgreSQL (hosted locally or in the cloud)

## 📁 Folder Structure
app/
├── policyholder/
├── agent/
├── system_admin/
├── it_admin/
├── stakeholder/
├── api/
├── global.css
prisma/#   h e r i t a g e l i f e - i n s u r a n c e  
 #   h e r i t a g e l i f e - i n s u r a n c e  
 