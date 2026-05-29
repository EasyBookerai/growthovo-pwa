#!/usr/bin/env node
const { execSync } = require('child_process');

try {
  console.log('Running lesson completion flow integration tests...\n');
  
  const result = execSync(
    'npx jest src/__tests__/lessonCompletionFlow.integration.test.tsx --testTimeout=30000 --verbose',
    {
      encoding: 'utf-8',
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    }
  );
  
  console.log(result);
  process.exit(0);
} catch (error) {
  console.error('Test execution failed:');
  console.error(error.stdout || error.message);
  console.error(error.stderr);
  process.exit(1);
}
