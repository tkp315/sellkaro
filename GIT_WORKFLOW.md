# Git Workflow — OLX Project

## Branch Structure

```
main  ←──── production (live code)
  │
  └──── dev  ←──── testing/staging
          │
          ├──── feature/auth
          ├──── feature/listings
          ├──── fix/chat-bug
          └──── ... (aur branches)
```

| Branch | Kaam | Seedha push? |
|---|---|---|
| `main` | Live/production code | ❌ Never |
| `dev` | Testing ke liye | ❌ Only via PR/merge |
| `feature/*` | Naya feature | ✅ Yahan kaam karo |
| `fix/*` | Bug fix | ✅ Yahan kaam karo |

---

## ⚙️ One-Time Setup (pehli baar)

```bash
# 1. Repo clone karo
git clone <repo-url>
cd olx

# 2. Dev branch pe aa jao
git checkout dev

# 3. Apna naam aur email set karo
git config user.name "Tumhara Naam"
git config user.email "tumhara@email.com"
```

---

## 🌿 Naya Kaam Shuru Karna (Naya Feature / Fix)

### Step 1 — Pehle main se latest lo

```bash
git checkout main
git pull origin main
```

### Step 2 — Naya branch banao main se

```bash
# Feature ke liye
git checkout -b feature/feature-name

# Bug fix ke liye
git checkout -b fix/bug-name

# Examples:
git checkout -b feature/auth
git checkout -b feature/listing-crud
git checkout -b fix/login-error
```

### Step 3 — Kaam karo aur commit karo

```bash
# Changes dekho
git status

# Specific files stage karo
git add src/modules/auth/auth.controller.ts
git add src/lib/auth.lib.ts

# Ya saari files ek saath
git add .

# Commit karo (clear message likho)
git commit -m "feat: add user login API"
git commit -m "fix: fix token expiry bug"
git commit -m "chore: add prisma schema"
```

### Step 4 — Branch push karo

```bash
# Pehli baar push (branch remote pe nahi hai)
git push -u origin feature/auth

# Iske baad sirf
git push
```

---

## 🔀 Dev Mein Merge Karna

Kaam complete hone ke baad pehle **dev** mein merge karo:

```bash
# Dev branch pe jao
git checkout dev

# Latest dev lo
git pull origin dev

# Apna branch merge karo
git merge feature/auth

# Push karo
git push origin dev
```

**Ya GitHub pe Pull Request banao:**
1. GitHub pe jao
2. `feature/auth` → `dev` ka PR banao
3. Dono log review karo
4. Merge karo

---

## 🚀 Main Mein Merge Karna (Release)

Jab `dev` pe sab test ho jaaye:

```bash
# Main pe jao
git checkout main

# Latest main lo
git pull origin main

# Dev merge karo
git merge dev

# Push karo
git push origin main
```

---

## 📥 Latest Code Lena (Daily)

### Apni branch update karo

```bash
# Pehle main se latest lo
git checkout main
git pull origin main

# Apni branch pe wapas jao
git checkout feature/auth

# Main ke changes apni branch mein laao
git merge main
```

### Dev se latest lo

```bash
git checkout dev
git pull origin dev
```

---

## ⚡ Daily Routine

```bash
# Din ki shuruat mein
git checkout dev
git pull origin dev
git checkout feature/apni-branch
git merge dev            # Latest dev changes lo

# ... kaam karo ...

# Raat ko ya kaam ke baad
git add .
git commit -m "feat: jo kiya wo likho"
git push
```

---

## 🚨 Important Rules

```
✅ Hamesha feature/* ya fix/* branch pe kaam karo
✅ Commit message clear likho (feat/fix/chore/docs)
✅ main pe seedha kabhi push mat karo
✅ Kaam karne se pahle git pull zaroor karo
✅ Ek branch mein ek hi kaam karo
❌ main mein seedha merge mat karo bina dev test ke
❌ Doosre ka kaam delete mat karo (git reset --hard mat use karo)
```

---

## 🛟 Agar Conflict Aaye

```bash
# Conflict dekho
git status

# VS Code mein open karo aur fix karo
# "Accept Current Change" ya "Accept Incoming Change" choose karo

# Fix ke baad
git add .
git commit -m "fix: resolve merge conflict"
```

---

## 📝 Commit Message Format

```
feat: naya feature
fix: bug fix
chore: config/setup changes
docs: documentation
refactor: code cleanup
style: formatting only
```

**Examples:**
```
feat: add listing create API
fix: fix JWT refresh token bug
chore: update prisma schema
docs: update git workflow
```

---

## 🔍 Useful Commands

```bash
git status              # Kya change hua dekho
git log --oneline       # Commits history
git branch              # Saari branches
git branch -a           # Remote branches bhi
git stash               # Changes temporarily save karo
git stash pop           # Wapas laao
git diff                # Kya badla dekho
```
