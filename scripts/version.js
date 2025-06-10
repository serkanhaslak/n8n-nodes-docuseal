#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function updateVersion(type = 'patch') {
  try {
    // Read root package.json
    const rootPackagePath = path.join(__dirname, '..', 'package.json');
    const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
    
    // Get current version
    const currentVersion = rootPackage.version;
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    // Calculate new version
    let newVersion;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }
    
    console.log(`📦 Updating version from ${currentVersion} to ${newVersion}`);
    
    // Update root package.json
    rootPackage.version = newVersion;
    fs.writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2) + '\n');
    console.log('✅ Updated root package.json');
    
    // Build the project to ensure dist exists
    console.log('🏗️  Building project...');
    execSync('npm run build:prod', { stdio: 'inherit' });
    
    // Update dist/package.json if it exists
    const distPackagePath = path.join(__dirname, '..', 'dist', 'package.json');
    if (fs.existsSync(distPackagePath)) {
      const distPackage = JSON.parse(fs.readFileSync(distPackagePath, 'utf8'));
      distPackage.version = newVersion;
      fs.writeFileSync(distPackagePath, JSON.stringify(distPackage, null, 2) + '\n');
      console.log('✅ Updated dist/package.json');
    }
    
    // Git operations
    console.log('📝 Creating git commit...');
    execSync('git add package.json dist/package.json', { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });
    
    // Create git tag
    console.log('🏷️  Creating git tag...');
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
    
    console.log(`✅ Version updated to ${newVersion}`);
    return newVersion;
    
  } catch (error) {
    console.error('❌ Version update failed:', error.message);
    process.exit(1);
  }
}

// Get version type from command line argument
const versionType = process.argv[2] || 'patch';
if (!['major', 'minor', 'patch'].includes(versionType)) {
  console.error('❌ Invalid version type. Use: major, minor, or patch');
  process.exit(1);
}

updateVersion(versionType);