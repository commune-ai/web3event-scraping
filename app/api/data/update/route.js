import { exec } from 'child_process';
import path from 'path';

export async function GET() {
    const batFilePath = path.join(process.cwd(), 'script', 'scrap.bat');
    console.log("here visited");
    return new Promise((resolve) => {
        exec(batFilePath, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing bat file: ${error}`);
                resolve(new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }));
            } else {
                console.log(`Bat file output: ${stdout}`);
                resolve(new Response(JSON.stringify({ message: 'Bat file executed successfully' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }));
            }
        });
    });
}