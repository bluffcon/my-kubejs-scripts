
/*
    server script
        requires LootJS

    quickly removes an item from jei, recipes, and loottables
    might not work perfectly
*/

function poof(item) {
    RecipeViewerEvents.removeEntriesCompletely("item", e => {
        e.remove(item)
    })
    ServerEvents.recipes(e => {
        e.remove({output: item})
        e.remove({input: item})
    })
    LootJS.lootTables(e => {
        e.modifyLootTables(/.*/).removeItem(item)
    })
}

poof("minecraft:coal")
poof("minecraft:oak_log")