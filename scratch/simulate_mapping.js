const items = [
    { name: "Re:Zero − Bắt Đầu Ở Thế Giới Khác (Phần 3)", origin_name: "Re:ZERO -Starting Life in Another World- Season 3", year: 2024, slug: "rezero-−-bat-dau-o-the-gioi-khac-phan-3" },
    { name: "Re:Zero − Bắt Đầu Ở Thế Giới Khác", origin_name: "Re:ZERO -Starting Life in Another World-", year: 2016, slug: "rezero-−-bat-dau-o-the-gioi-khac" },
    { name: "Re:Zero - Bắt đầu lại ở thế giới khác", origin_name: "Re:Zero - Starting Life in Another World", year: 2016, slug: "rezero-bat-dau-lai-o-the-gioi-khac" },
    { name: "Re:Zero − Bắt Đầu Ở Thế Giới Khác (Phần 4)", origin_name: "Re:ZERO -Starting Life in Another World- Season 4", year: 2016, slug: "rezero-−-bat-dau-o-the-gioi-khac-phan-4" },
    { name: "Re: Bắt đầu lại ở một thế giới khác lạ Phần 2 Part 2", origin_name: "Re: Zero kara Hajimeru Isekai Seikatsu 2nd Season Part 2", year: 2021, slug: "re-bat-dau-lai-o-mot-the-gioi-khac-la-phan-2-part-2" }
];

function simulateMapping(title, year, originalTitle, season) {
    console.log(`\n--- Simulating for: ${title} (Season ${season}, Year ${year}) ---`);
    
    const scoredItems = items.map(item => {
        let score = 0;
        const itemName = item.name.toLowerCase();
        const itemOrigin = item.origin_name.toLowerCase();
        const lowTitle = title.toLowerCase();
        const lowOrig = originalTitle.toLowerCase();

        // Exact match
        if (itemName === lowTitle || itemOrigin === lowOrig) score += 10;
        // Contains title
        if (itemName.includes(lowTitle) || itemOrigin.includes(lowOrig)) score += 5;
        // Match year
        if (item.year === year) score += 5;
        
        // Season specific logic
        if (season === 1) {
            if (!itemName.includes('phần') && !itemName.includes('season')) score += 5;
            if (!itemName.includes('part')) score += 2;
        } else {
            // If season > 1, prefer items that mention the season
            if (itemName.includes(`phần ${season}`) || itemOrigin.includes(`season ${season}`)) score += 10;
        }

        return { 
            name: item.name, 
            score, 
            slug: item.slug 
        };
    });

    scoredItems.sort((a, b) => b.score - a.score);
    
    scoredItems.forEach(si => {
        console.log(`Score: ${si.score.toString().padEnd(2)} | Name: ${si.name}`);
    });

    console.log(`=> WINNER: ${scoredItems[0].name} (${scoredItems[0].slug})`);
}

// Case 1: Search for Season 1
simulateMapping("Re:Zero - Bắt đầu lại ở thế giới khác", 2016, "Re:Zero - Starting Life in Another World", 1);

// Case 2: Search for Season 3
simulateMapping("Re:Zero - Bắt đầu lại ở thế giới khác", 2024, "Re:Zero - Starting Life in Another World", 3);
