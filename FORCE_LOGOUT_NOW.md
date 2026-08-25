# 🚨 FORCE LOGOUT - Use Browser Console

## The Problem
The "Log Out" button isn't working because `Alert.alert` doesn't work properly on web browsers.

## ⚡ INSTANT SOLUTION - Browser Console Method

### Step 1: Open Browser Console
Press **F12** or **Ctrl+Shift+I** (Windows) / **Cmd+Option+I** (Mac)

### Step 2: Go to Console Tab
Click on the **"Console"** tab at the top of the developer tools

### Step 3: Paste This Code
Copy and paste this entire code block into the console:

```javascript
// Force logout and clear all auth data
(async function() {
    console.log('🔓 Starting force logout...');
    
    // Clear localStorage
    localStorage.clear();
    console.log('✓ localStorage cleared');
    
    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✓ sessionStorage cleared');
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    console.log('✓ Cookies cleared');
    
    // Clear IndexedDB (Supabase storage)
    if (window.indexedDB) {
        const databases = await window.indexedDB.databases();
        databases.forEach(db => {
            if (db.name) {
                window.indexedDB.deleteDatabase(db.name);
                console.log(`✓ IndexedDB "${db.name}" deleted`);
            }
        });
    }
    
    console.log('✅ Logout complete! Reloading page...');
    
    // Reload page to show login screen
    setTimeout(() => {
        window.location.reload();
    }, 500);
})();
```

### Step 4: Press Enter
The page will reload and show the **enhanced login screen**!

---

## 🎯 Alternative - Simple Method

If the above doesn't work, try this simpler version:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 🔧 Fix the Log Out Button (For Developer)

The issue is that `Alert.alert` from React Native doesn't work on web. We need to use `window.confirm` instead for web platforms.

**Quick Fix:** Update `handleLogOut` in `SimpleProfileScreen.tsx`:

```typescript
async function handleLogOut() {
  // Use window.confirm for web, Alert for mobile
  const confirmed = typeof window !== 'undefined' 
    ? window.confirm('Are you sure you want to log out?')
    : await new Promise(resolve => {
        Alert.alert(
          'Log Out',
          'Are you sure you want to log out?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Log Out', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      });
  
  if (confirmed) {
    await supabase.auth.signOut();
  }
}
```

---

## ✅ What Happens After Logout

Once you run the console command and the page reloads, you'll see:

1. **Enhanced Login Screen** with purple theme
2. **"Welcome Back"** heading
3. **Animated input fields** with purple glow on focus
4. **Real-time validation** as you type
5. **Success checkmarks** when validation passes
6. **Shake animations** on errors
7. **Spring physics** button feedback

---

## 🆘 Still Not Working?

If the console method doesn't work:

1. **Close the browser tab completely**
2. **Open a new incognito/private window**
3. **Navigate to:** `crowheros.com/profile.html`
4. **You'll see the login screen immediately**

---

**USE THE BROWSER CONSOLE METHOD ABOVE - IT WILL WORK!** 🚀
