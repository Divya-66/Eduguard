##  First-Time Setup (widnows powershell)


# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt


---

##  Running the App


# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Start the application
python app.py


Open your browser and visit: *[http://localhost:5000](http://localhost:5000)*

---

##  Troubleshooting

If virtual environment activation fails, run:


Set-ExecutionPolicy RemoteSigned -Scope CurrentUser


---

##  Stopping / Exiting

- *Stop the app:* Ctrl + C
- *Deactivate venv:* deactivate

---


##  🛠Git Collaboration Workflow

We use a **single main branch** as the source of truth.  
Follow these steps to contribute effectively.

###  Clone the Repository

git clone https://github.com/anshikkumartiwari/welldoc.git
cd welldoc


###  Sync with main Before Branching

git checkout main
git pull origin main


###  Create and Switch to a New Branch

git checkout -b feature/your-feature-name

> Use descriptive branch names, e.g., feature/login-page or fix/api-timeout.

###  Work, Stage, and Commit

git add .
git commit -m "Describe your changes clearly"


###  Push Your Branch to Remote

git push -u origin feature/your-feature-name


###  Resetting a Branch to Remote State

git fetch origin
git reset --hard origin/feature/your-feature-name

⚠ *Warning:* This deletes uncommitted changes.  
If you want to keep them:

git stash
# Restore later
git stash pop


###  Merging a Branch into main

git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main


###  Keeping Your Branch Updated with main

git checkout feature/your-feature-name
git pull origin main --rebase


###  Creating a Pull Request (PR)
1. Push your branch to GitHub.
2. Go to the repository page → *"Compare & pull request"*.
3. Add a clear title and description.
4. Assign reviewers.
5. Submit PR.
6. Once approved, merge via GitHub UI or CLI.

---

##  Quick Reference – Git Flow Summary


# 1. Sync main
git checkout main
git pull origin main

# 2. Create branch
git checkout -b feature/xyz

# 3. Work & commit
git add .
git commit -m "Message"

# 4. Push branch
git push -u origin feature/xyz

# 5. Keep updated
git pull origin main --rebase

# 6. Merge to main (after PR approval)
git checkout main
git pull origin main
git merge feature/xyz
git push origin main


---
