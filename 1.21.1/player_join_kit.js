/*
    server script
        requires Forestry:CE and FTB Quests (for items)

    gives items in specific slots to players joining for the first time

    uncomment the last line to add the "freertp" tag to players. see "server_teleport_commands.js" to see what that is for
    additional commented bit can teleport players to the spawn position and apply slow falling
*/

PlayerEvents.loggedIn(e => {
    if (!e.player.tags.contains("joined.player")) {
        e.player.getInventory().setItem(0,"minecraft:stone_sword")
        e.player.getInventory().setItem(1,"forestry:axe_kit")
        e.player.getInventory().setItem(2,"forestry:pickaxe_kit")

        e.player.getInventory().setItem(7, Item.of("ftbquests:book"))
        e.player.getInventory().setItem(8, Item.of("forestry:honeyed_slice", 8))

        e.player.getInventory().setItem(36, Item.of("minecraft:leather_boots"))
        e.player.getInventory().setItem(37, Item.of("minecraft:chainmail_leggings"))

        e.player.getInventory().setItem(35, Item.of("minecraft:apple", 4))

        if (e.server.isDedicated() == true) {
            e.server.tell([Text.darkGreen("["), Text.green("+"), Text.darkGreen("] "), Text.gold(e.player.username), Text.white(" just joined for the first time!")])
            /*
                e.player.teleportTo("overworld", 0.5, 70, 0.5, e.player.getYaw(), e.player.getPitch())
                e.player.potionEffects.add("minecraft:slow_falling", 300, 0)
            */
        }
        
        e.player.tags.add("joined.player")
        // e.player.tags.add("freertp")
    }
})