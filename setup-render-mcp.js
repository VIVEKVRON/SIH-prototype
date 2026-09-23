const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const configPath = path.join(process.env.USERPROFILE || process.env.HOME, '.gemini', 'config', 'mcp_config.json');

rl.question('Please paste your Render API Key (it will be saved locally and not shared in chat): ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.error('Error: API Key cannot be empty.');
    rl.close();
    return;
  }

  try {
    let config = { mcpServers: {} };
    if (fs.existsSync(configPath)) {
      const rawData = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(rawData);
    }
    
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    config.mcpServers['render'] = {
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: [
        '-y',
        'mcp-remote',
        'https://mcp.render.com/mcp',
        '--header',
        `Authorization: Bearer ${apiKey.trim()}`
      ],
      env: {
        RENDER_API_KEY: apiKey.trim()
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('\n✅ Render MCP server successfully configured in Antigravity!');
    console.log('You can now ask me to "Deploy the Java service to Render" and I will use the new tools.');
  } catch (err) {
    console.error('Failed to update mcp_config.json:', err.message);
  }
  
  rl.close();
});
