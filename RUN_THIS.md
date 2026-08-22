# ⚡ RUN THIS - Automated Setup

## 🎯 I've Created Automated Scripts For You

I can't access external websites like Supabase for you, but I've automated **everything else**.

---

## 🚀 Quick Setup (3 Commands)

### Windows (PowerShell):
```powershell
powershell -ExecutionPolicy Bypass -File auto-setup.ps1
```

### Mac/Linux:
```bash
bash auto-setup.sh
```

**What it does:**
- ✅ Checks Node.js installed
- ✅ Installs dependencies
- ✅ Runs interactive wizard to create `.env`
- ✅ Creates combined SQL file for database
- ✅ Shows you exactly what to do next

---

## 📋 The 3 Things You Must Do Manually

### 1. Create Supabase Project (5 minutes)
I **cannot** do this for you because it requires:
- Logging into Supabase.com
- Creating an account
- Clicking buttons in their dashboard

**You do:**
1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Name: `growthovo`
4. Set password (save it!)
5. Wait 2-3 minutes

### 2. Get API Keys (1 minute)
**You do:**
1. Click Settings → API
2. Copy "Project URL"
3. Copy "anon public" key

### 3. Run the Setup Wizard (1 minute)
**You do:**
```bash
node setup-wizard.js
```

It will ask you for the keys you copied in step 2.

---

## ✅ What I've Automated For You

### Created These Files:
- ✅ `ascevo/.env` (template)
- ✅ `setup-wizard.js` (interactive setup)
- ✅ `auto-setup.sh` (Mac/Linux automation)
- ✅ `auto-setup.ps1` (Windows automation)
- ✅ All documentation files

### The Wizard Will:
- ✅ Ask for your Supabase credentials
- ✅ Ask if you want OpenAI key (optional)
- ✅ Create `.env` file with your values
- ✅ Create `ascevo/setup-database.sql` (combined SQL)
- ✅ Show you exact next steps

---

## 🎯 The Fastest Path

### Step 1: Create Supabase Project
```
Browser → https://supabase.com
Click: New project
Wait: 2-3 minutes
```

### Step 2: Run My Script
```bash
node setup-wizard.js
```

Paste your keys when asked.

### Step 3: Setup Database
```
Browser → Supabase SQL Editor
Copy: ascevo/setup-database.sql
Paste → Click RUN
```

### Step 4: Start App
```bash
cd ascevo
npm start
```

Press `w` for web.

---

## 💡 Why I Can't Do It All

### What I CAN Automate:
- ✅ Check dependencies
- ✅ Install packages
- ✅ Create config files
- ✅ Run local scripts
- ✅ Combine SQL files
- ✅ Start development server

### What I CANNOT Automate:
- ❌ Create external accounts (Supabase, OpenAI)
- ❌ Access websites in your browser
- ❌ Click buttons in web dashboards
- ❌ Run SQL in external databases
- ❌ Deploy to production

**Those require YOU to:**
1. Log into websites
2. Click buttons
3. Copy/paste values

---

## 🚀 Run The Automation Now

### On Windows:
```powershell
powershell -ExecutionPolicy Bypass -File auto-setup.ps1
```

### On Mac/Linux:
```bash
bash auto-setup.sh
```

### Or Just The Wizard:
```bash
node setup-wizard.js
```

**Takes 2 minutes, walks you through everything!** ✅

---

## 📊 What You'll See

```
🚀 Growthovo Setup Wizard

📝 Let's set up your Supabase credentials

If you don't have a Supabase project yet:
1. Go to https://supabase.com/dashboard
2. Click "New project"
...

Do you have a Supabase project ready? (y/n): _
```

Just answer the questions!

---

## ✅ After Running The Wizard

You'll have:
- ✅ `ascevo/.env` file configured
- ✅ `ascevo/setup-database.sql` ready to run
- ✅ Clear instructions for next steps

Then:
1. Copy `setup-database.sql` content
2. Paste in Supabase SQL Editor
3. Click RUN
4. Start your app: `npm start`

---

## 🎯 Bottom Line

**I've automated everything I can automate.**

**You just need to:**
1. Create Supabase account (website)
2. Run my wizard script (1 command)
3. Paste SQL in Supabase (copy/paste)
4. Start the app (1 command)

**Total time: 10 minutes** ⚡

---

## 🚀 START NOW

```bash
node setup-wizard.js
```

That's it. Run that command. Follow the prompts. Done! ✅
