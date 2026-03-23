import { NetworkService } from './src/services/NetworkService.js';

async function testStats() {
    try {
        console.log("Fetching live stats...");
        const stats = await NetworkService.getLiveStats();
        console.log("Stats result:");
        console.log(JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testStats();
