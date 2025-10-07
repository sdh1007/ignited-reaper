#!/bin/bash

# IgNited Reaper - Push to GitHub Script
# Run this script after creating your GitHub repository

echo "🏴‍☠️ IgNited Reaper - GitHub Push Script"
echo "========================================"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository"
    exit 1
fi

# Get the current repository status
echo "📊 Repository Status:"
git status --short
echo ""

# Prompt for GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Error: GitHub username is required"
    exit 1
fi

# Set the remote origin
echo "🔗 Setting up remote origin..."
git remote add origin https://github.com/$GITHUB_USERNAME/ignited-reaper.git

# Check if remote was added successfully
if git remote -v | grep -q "origin"; then
    echo "✅ Remote origin added successfully"
else
    echo "❌ Error: Failed to add remote origin"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Success! Your IgNited Reaper project has been pushed to GitHub!"
    echo "🔗 Repository URL: https://github.com/$GITHUB_USERNAME/ignited-reaper"
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Set up deployment (Vercel recommended)"
    echo "3. Add collaborators if needed"
    echo "4. Create issues and project boards"
    echo ""
    echo "Happy coding! 🏴‍☠️"
else
    echo "❌ Error: Failed to push to GitHub"
    echo "Make sure:"
    echo "1. The repository exists on GitHub"
    echo "2. You have push permissions"
    echo "3. Your GitHub username is correct"
    exit 1
fi
