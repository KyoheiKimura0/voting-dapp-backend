import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const deployDir = path.join(__dirname, 'deploy');

const deployScripts = fs.readdirSync(deployDir).filter(file => file.endsWith('.ts'));

// Execute each deploy script in order
for (const script of deployScripts) {
    const scriptPath = path.join(deployDir, script);
    console.log(`Executing ${scriptPath}...`);

    try {
        // Execute the script using ts-node
        execSync(`npx ts-node ${scriptPath}`, { stdio: 'inherit' });
        console.log(`${scriptPath} executed successfully.`);
    } catch (error) {
        console.error(`Error executing ${scriptPath}:`, error);
        break;
    }
}