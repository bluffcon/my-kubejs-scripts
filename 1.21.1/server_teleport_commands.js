/*
    server script
        requires Forestry:CE (for items)

    adds server-purpose teleport commands that take payments for execution
    they are also adapted for singleplayer, throwing necessary errors.

    summary:
        go      server only, shortcut for all other commands listed here.
                additionally adds teleport requests. they expire after 1 minute and take payment from both players
                use /go help for a summary of what it does

        spawn   server only, teleports you to exactly 0 70 0
                change position if your spawn is somewhere else

        rtp     teleports you to a random spot in the sky in a 24000 by 24000 square and gives you slow falling
                players with "freertp" tag can teleport without payment one time. you should give the tag to new joining players (see "player_join_kit.js")

        home    lets you set a home point, view its position, and teleport to it
                /home pos does not consume payment

    this way originally made for the Forestry: CE 2 year anniversary SMP
    to replace the payment item, first find and replace "forestry:stamp_1n" (item) and then "1n" (payment in strings)

    all commands give the player slow falling. to remove it when the player hits ground, uncomment the below script
*/

/*
    PlayerEvents.tick(e => {
        if (e.player.hasEffect("minecraft:slow_falling") && e.player.onGround()) {
            e.player.removeEffect("minecraft:slow_falling")
        }
    })
*/


ServerEvents.commandRegistry(e => {
    if (e.isForMultiPlayer() == true) {
    e.register(
        e.commands.literal("spawn")
        .executes(c => {
            let p = c.source.getPlayer()

            if (p.getLevel().dimension !== "minecraft:overworld") {
                p.tell(Text.red("You're not in the overworld"))
                return 0
            }

            if (p.getInventory().contains(Item.of("forestry:stamp_1n"))) {
                let s = p.getInventory().findSlotMatchingItem(Item.of("forestry:stamp_1n"))

                p.getInventory().removeItem(s, 1)
                p.teleportTo("overworld", 0, 70, 0, p.getYaw(), p.getPitch())
                p.potionEffects.add("minecraft:slow_falling", 300, 0)
                p.tell(Text.gold("Teleported you to spawn!").append(Text.white(" (-1n)")))
                return 1
            } else {
                p.tell(Text.red("You cannot afford this").append(Text.white(" (1n)")))
                return 0
            }
        })
    )}

    e.register(
        e.commands.literal("rtp")
        .executes(c => {
            let p = c.source.getPlayer()
            let rx, rz, d

            if (p.getLevel().dimension !== "minecraft:overworld") {
                p.tell(Text.red("You're not in the overworld"))
                return 0
            }

            if (p.getInventory().contains(Item.of("forestry:stamp_1n"))) {
                let s = p.getInventory().findSlotMatchingItem(Item.of("forestry:stamp_1n"))
                do {
                    rx = Math.random() * 24000 - 12000;
                    rz = Math.random() * 24000 - 12000;
                    d = Math.round(p.distanceTo(rx, 256, rz))
                } while (d < 1000)

                p.getInventory().removeItem(s, 1)
                p.teleportTo("overworld", rx, 256, rz, p.getYaw(), p.getPitch())
                p.tell(Text.green("You've been randomly teleported!").append(Text.white(" (-1n)")))
                p.tell(Text.white("・ Distance traveled: ").append(Text.gold(d + " blocks")))
                p.potionEffects.add("minecraft:slow_falling", 1200, 0)
                p.potionEffects.add("minecraft:blindness", 120, 0)
                return 1
            } if (p.tags.contains("freertp")) {
                do {
                    rx = Math.random() * 24000 - 12000;
                    rz = Math.random() * 24000 - 12000;
                    d = Math.round(p.distanceTo(rx, 256, rz))
                } while (d < 1000)

                p.teleportTo("overworld", rx, 256, rz, p.getYaw(), p.getPitch())
                p.tell(Text.green("You've been randomly teleported!").append(Text.white(" (Free)")))
                p.tell(Text.white("・ Distance traveled: ").append(Text.gold(d + " blocks")))
                p.tags.remove("freertp")
                p.potionEffects.add("minecraft:slow_falling", 1200, 0)
                p.potionEffects.add("minecraft:blindness", 120, 0)
                return 1
            } else {
                p.tell(Text.red("You cannot afford this").append(Text.white(" (1n)")))
                return 0
            }
            
        })
    )


    e.register(
        e.commands.literal("home")
        .then(e.commands.literal("set")
        .executes(c => {
            let p = c.source.getPlayer()
            let pos = p.position()

            if (p.getLevel().dimension !== "minecraft:overworld") {
                p.tell(Text.red("You're not in the overworld"))
                return 0
            }

            if (p.getInventory().contains(Item.of("forestry:stamp_1n"))) {
                let s = p.getInventory().findSlotMatchingItem(Item.of("forestry:stamp_1n"))

                p.getInventory().removeItem(s, 1)
                p.persistentData.putDouble("fhome_x", pos.x())
                p.persistentData.putDouble("fhome_y", pos.y())
                p.persistentData.putDouble("fhome_z", pos.z())

                p.tell(Text.yellow("Your home is now here! You can only have one!").append(Text.white(" (-1n)")))
                return 1
            } else {
                p.tell(Text.red("You cannot afford this").append(Text.white(" (1n)")))
                return 0
            }
        }))
        .then(e.commands.literal("go")
        .executes(c => {
            let p = c.source.getPlayer()
            let hx, hy, hz

            if (p.getLevel().dimension !== "minecraft:overworld") {
                p.tell(Text.red("You're not in the overworld"))
                return 0
            }
            if (p.persistentData.getDouble("fhome_x") == 0.0 && p.persistentData.getDouble("fhome_y") == 0.0) {
                p.tell(Text.red("Your home position is unset!"))
                return 0
            }

            if (p.getInventory().contains(Item.of("forestry:stamp_1n"))) {
                let s = p.getInventory().findSlotMatchingItem(Item.of("forestry:stamp_1n"))

                p.getInventory().removeItem(s, 1)
                hx = p.persistentData.getDouble("fhome_x")
                hy = p.persistentData.getDouble("fhome_y")
                hz = p.persistentData.getDouble("fhome_z")

                p.teleportTo("overworld", hx, hy, hz, p.getYaw(), p.getPitch())
                p.tell(Text.green("Teleported you home").append(Text.white(" (-1n)")))
                return 1
            } else {
                p.tell(Text.red("You cannot afford this").append(Text.white(" (1n)")))
                return 0
            }
        }))
        .then(e.commands.literal("pos")
        .executes(c => {
            let p = c.source.getPlayer()
            let hx, hy, hz

            if (p.persistentData.getDouble("fhome_x") == 0.0 && p.persistentData.getDouble("fhome_y") == 0.0) {
                p.tell(Text.red("Your home position is unset!"))
                return 0
            }

                hx = Math.round(p.persistentData.getDouble("fhome_x"))
                hy = Math.round(p.persistentData.getDouble("fhome_y"))
                hz = Math.round(p.persistentData.getDouble("fhome_z"))

                p.tell(Text.gray("Your home is at: ").append(Text.white("x"+hx)).append(Text.gold(" y"+hy)).append(Text.white(" z"+hz)))
                return 1
        }))
    )

    if (e.isForMultiPlayer() == true) {
    e.register(
        e.commands.literal("go")
            .then(e.commands.literal("home")
            .executes(c => {
                let p = c.source.getPlayer()
                let hx, hy, hz

                if (p.getLevel().dimension !== "minecraft:overworld") {
                    p.tell(Text.red("You're not in the overworld"))
                    return 0
                }
                if (p.persistentData.getDouble("fhome_x") == 0.0 && p.persistentData.getDouble("fhome_y") == 0.0) {
                    p.tell(Text.red("Your home position is unset!"))
                    return 0
                }

                if (p.getInventory().contains(Item.of("forestry:stamp_1n"))) {
                    let s = p.getInventory().findSlotMatchingItem(Item.of("forestry:stamp_1n"))

                    p.getInventory().removeItem(s, 1)
                    hx = p.persistentData.getDouble("fhome_x")
                    hy = p.persistentData.getDouble("fhome_y")
                    hz = p.persistentData.getDouble("fhome_z")

                    p.teleportTo("overworld", hx, hy, hz, p.getYaw(), p.getPitch())
                    p.tell(Text.green("Teleported you home").append(Text.white(" (-1n)")))
                    return 1
                } else {
                    p.tell(Text.red("You cannot afford this").append(Text.white(" (1n)")))
                    return 0
                }}
            ))

            .then(e.commands.literal("spawn")
            .executes(c => {
                let p = c.source.getPlayer()

                if (p.getLevel().dimension !== "minecraft:overworld") {
                    p.tell(Text.red("You're not in the overworld"))
                    return 0
                }

                if (p.getInventory().contains(Item.of("forestry:stamp_1n"))) {
                    let s = p.getInventory().findSlotMatchingItem(Item.of("forestry:stamp_1n"))

                    p.getInventory().removeItem(s, 1)
                    p.teleportTo("overworld", 0, 70, 0, p.getYaw(), p.getPitch())
                    p.potionEffects.add("minecraft:slow_falling", 300, 0)
                    p.tell(Text.gold("Teleported you to spawn!").append(Text.white(" (-1n)")))
                    return 1
                } else {
                    p.tell(Text.red("You cannot afford this").append(Text.white(" (1n)")))
                    return 0
                }}
            ))

            .then(e.commands.literal("randomly")
            .executes(c => {
                let p = c.source.getPlayer()
                let rx, rz, d

                if (p.getLevel().dimension !== "minecraft:overworld") {
                    p.tell(Text.red("You're not in the overworld"))
                    return 0
                }

                if (p.getInventory().contains(Item.of("forestry:stamp_1n"))) {
                    let s = p.getInventory().findSlotMatchingItem(Item.of("forestry:stamp_1n"))
                    do {
                        rx = Math.random() * 24000 - 12000;
                        rz = Math.random() * 24000 - 12000;
                        d = Math.round(p.distanceTo(rx, 256, rz))
                    } while (d < 1000)

                    p.getInventory().removeItem(s, 1)
                    p.teleportTo("overworld", rx, 256, rz, p.getYaw(), p.getPitch())
                    p.tell(Text.green("You've been randomly teleported!").append(Text.white(" (-1n)")))
                    p.tell(Text.white("・ Distance traveled: ").append(Text.gold(d + " blocks")))
                    p.potionEffects.add("minecraft:slow_falling", 1200, 0)
                    p.potionEffects.add("minecraft:blindness", 120, 0)
                    return 1
                } if (p.tags.contains("freertp")) {
                    do {
                        rx = Math.random() * 24000 - 12000;
                        rz = Math.random() * 24000 - 12000;
                        d = Math.round(p.distanceTo(rx, 256, rz))
                    } while (d < 1000)

                    p.teleportTo("overworld", rx, 256, rz, p.getYaw(), p.getPitch())
                    p.tell(Text.green("You've been randomly teleported!").append(Text.white(" (Free)")))
                    p.tell(Text.white("・ Distance traveled: ").append(Text.gold(d + " blocks")))
                    p.tags.remove("freertp")
                    p.potionEffects.add("minecraft:slow_falling", 1200, 0)
                    p.potionEffects.add("minecraft:blindness", 120, 0)
                    return 1
                } else {
                    p.tell(Text.red("You cannot afford this").append(Text.white(" (1n)")))
                    return 0
                }}
            ))


            .then(e.commands.literal("tp")
                .then(e.commands.literal("to")
                .executes(c => {
                    let p = c.source.getPlayer()
                    p.tell(Text.white("Missing something?").append(Text.yellow(" You need to specify who you want to teleport to")))
                    return 0
                })
                    .then(e.commands.argument("player", e.arguments.PLAYER.create(e))
                        .executes(c => {
                            let p = c.source.getPlayer()
                            let target = e.arguments.PLAYER.getResult(c, "player")

                            if (!p || !target) return 0

                            if (p.getLevel().dimension !== "minecraft:overworld" || target.getLevel().dimension !== "minecraft:overworld") {
                                p.tell(Text.red("You're not in the overworld"))
                                return 0
                            }

                            if (p.uuid.toString() === target.uuid.toString()) {
                                p.tell(Text.red("You cannot teleport to yourself"))
                                return 0
                            }

                            if (!p.getInventory().contains(Item.of("forestry:stamp_1n"))) {
                                p.tell(Text.red("You cannot afford this").append(Text.white(" (1n)")))
                                return 0
                            }

                            p.persistentData.remove("tp_out_uuid")
                            p.persistentData.remove("tp_out_type")
                            p.persistentData.remove("tp_out_time")

                            p.persistentData.putString("tp_out_uuid", target.uuid.toString())
                            p.persistentData.putString("tp_out_type", "to")
                            p.persistentData.putLong("tp_out_time", p.getLevel().getTime())

                            target.persistentData.putString("tp_in_uuid", p.uuid.toString())
                            target.persistentData.putString("tp_in_type", "to")
                            target.persistentData.putLong("tp_in_time", p.getLevel().getTime())

                            p.tell(Text.green("Teleport request sent to ").append(Text.gold(target.username + ". ")).append(Text.white("Pending accept (1n)")))
                            target.tell(Text.yellow(p.username).append(Text.white(" wants to teleport to you. Use ")).append(Text.gold("/go tp accept " + p.username)).append(Text.white(" within 1 minute to let them teleport.")).append(Text.white(" (1n)")))

                            if (!target.getInventory().contains(Item.of("forestry:stamp_1n"))) {
                                target.tell(Text.red("You were sent a request but you currently don't have enough to accept it.").append(Text.white(" (1n)")))
                            }

                            return 1
                        })
                    )
                )
                .then(e.commands.literal("here")
                .executes(c => {
                    let p = c.source.getPlayer()
                    p.tell(Text.white("Missing something?").append(Text.yellow(" You need to specify who you want to teleport to you")))
                    return 0
                })
                    .then(e.commands.argument("player", e.arguments.PLAYER.create(e))
                        .executes(c => {
                            let p = c.source.getPlayer()
                            let target = e.arguments.PLAYER.getResult(c, "player")

                            if (!p || !target) return 0

                            if (p.getLevel().dimension !== "minecraft:overworld" || target.getLevel().dimension !== "minecraft:overworld") {
                                p.tell(Text.red("You're not in the overworld"))
                                return 0
                            }

                            if (p.uuid.toString() === target.uuid.toString()) {
                                p.tell(Text.red("You cannot teleport to yourself"))
                                return 0
                            }

                            if (!p.getInventory().contains(Item.of("forestry:stamp_1n"))) {
                                p.tell(Text.red("You cannot afford this").append(Text.white(" (1n)")))
                                return 0
                            }

                            p.persistentData.remove("tp_out_uuid")
                            p.persistentData.remove("tp_out_type")
                            p.persistentData.remove("tp_out_time")

                            p.persistentData.putString("tp_out_uuid", target.uuid.toString())
                            p.persistentData.putString("tp_out_type", "here")
                            p.persistentData.putLong("tp_out_time", p.getLevel().getTime())

                            target.persistentData.putString("tp_in_uuid", p.uuid.toString())
                            target.persistentData.putString("tp_in_type", "here")
                            target.persistentData.putLong("tp_in_time", p.getLevel().getTime())

                            p.tell(Text.green("Teleport request sent to ").append(Text.gold(target.username + ". ")).append(Text.white("Pending accept (1n)")))
                            target.tell(Text.yellow(p.username).append(Text.white(" wants you to teleport to them. Use ")).append(Text.gold("/go tp accept " + p.username)).append(Text.white(" within 1 minute to teleport yourself.")).append(Text.white(" (-1n)")))

                            if (!target.getInventory().contains(Item.of("forestry:stamp_1n"))) {
                                target.tell(Text.red("You were sent a request but you currently don't have enough to accept it.").append(Text.white(" (1n)")))
                            }

                            return 1
                        })
                    )
                )
                .then(e.commands.literal("accept")
                .executes(c => {
                    let p = c.source.getPlayer()
                    p.tell(Text.white("Missing something?").append(Text.yellow(" You need to specify who you're accepting")))
                    return 0
                })
                    .then(e.commands.argument("player", e.arguments.PLAYER.create(e))
                        .executes(c => {
                            let p = c.source.getPlayer()
                            let requester = e.arguments.PLAYER.getResult(c, "player")

                            if (!p || !requester) return 0

                            if (p.getLevel().dimension !== "minecraft:overworld" || requester.getLevel().dimension !== "minecraft:overworld") {
                                p.tell(Text.red("You're not in the overworld"))
                                return 0
                            }

                            if (p.uuid.toString() === requester.uuid.toString()) {
                                p.tell(Text.red("You cannot teleport to yourself"))
                                return 0
                            }

                            let inUuid = p.persistentData.getString("tp_in_uuid")
                            let inType = p.persistentData.getString("tp_in_type")
                            let inTime = p.persistentData.getLong("tp_in_time")

                            if (!inUuid || inUuid !== requester.uuid.toString()) {
                                p.tell(Text.red("You have no pending teleport request from that player"))
                                return 0
                            }

                            let now = p.getLevel().getTime()
                            if (now - inTime > 1200) {

                                requester.tell(Text.red(p.username).append(Text.white(" just tried to accept your request after the timeout window and failed")))

                                p.persistentData.remove("tp_in_uuid")
                                p.persistentData.remove("tp_in_type")
                                p.persistentData.remove("tp_in_time")
                                requester.persistentData.remove("tp_out_uuid")
                                requester.persistentData.remove("tp_out_type")
                                requester.persistentData.remove("tp_out_time")
                                p.tell(Text.red("That request has expired (1 minute timeout)"))
                                return 0
                            }

                            if (!p.getInventory().contains(Item.of("forestry:stamp_1n")) || !requester.getInventory().contains(Item.of("forestry:stamp_1n"))) {
                                p.tell(Text.red("Teleport cancelled: one of you does not have 1n"))
                                requester.tell(Text.red("Teleport cancelled: one of you does not have 1n"))
                                return 0
                            }

                            if (inType === "to") {
                                let pos = p.position()
                                requester.teleportTo("overworld", pos.x(), pos.y(), pos.z(), requester.getYaw(), requester.getPitch())
                                requester.tell(Text.gold("Teleported to ").append(Text.yellow(p.username)).append(Text.white(" (-1n)")))
                                p.tell(Text.yellow(requester.username).append(Text.gold(" teleported to you")).append(Text.white(" (-1n)")))
                            } else if (inType === "here") {
                                let pos = requester.position()
                                p.teleportTo("overworld", pos.x(), pos.y(), pos.z(), p.getYaw(), p.getPitch())
                                p.tell(Text.gold("Teleported to ").append(Text.yellow(requester.username)).append(Text.white(" (-1n)")))
                                requester.tell(Text.yellow(p.username).append(Text.gold(" teleported to you")).append(Text.white(" (-1n)")))
                            } else {
                                p.tell(Text.red("Invalid request type"))
                                return 0
                            }

                            let s1 = p.getInventory().findSlotMatchingItem(Item.of("forestry:stamp_1n"))
                            p.getInventory().removeItem(s1, 1)
                            let s2 = requester.getInventory().findSlotMatchingItem(Item.of("forestry:stamp_1n"))
                            requester.getInventory().removeItem(s2, 1)

                            p.persistentData.remove("tp_in_uuid")
                            p.persistentData.remove("tp_in_type")
                            p.persistentData.remove("tp_in_time")
                            requester.persistentData.remove("tp_out_uuid")
                            requester.persistentData.remove("tp_out_type")
                            requester.persistentData.remove("tp_out_time")

                            return 1
                        })
                    )
                )
                .then(e.commands.literal("deny")
                .executes(c => {
                    let p = c.source.getPlayer()
                    p.tell(Text.white("Missing something?").append(Text.yellow(" You need to specify who you're denying")))
                    return 0
                })
                    .then(e.commands.argument("player", e.arguments.PLAYER.create(e))
                        .executes(c => {
                            let p = c.source.getPlayer()
                            let other = e.arguments.PLAYER.getResult(c, "player")

                            if (!p || !other) return 0

                            let cleared = false

                            let outUuid = p.persistentData.getString("tp_out_uuid")
                            if (outUuid && outUuid === other.uuid.toString()) {
                                p.persistentData.remove("tp_out_uuid")
                                p.persistentData.remove("tp_out_type")
                                p.persistentData.remove("tp_out_time")

                                if (other.persistentData.getString("tp_in_uuid") === p.uuid.toString()) {
                                    other.persistentData.remove("tp_in_uuid")
                                    other.persistentData.remove("tp_in_type")
                                    other.persistentData.remove("tp_in_time")
                                }
                                cleared = true
                                p.tell(Text.gray("Cancelled your teleport request to ").append(Text.white(other.username)))
                                other.tell(Text.white(p.username).append(Text.gray(" cancelled their teleport request to you")))
                            }

                            let inUuid = p.persistentData.getString("tp_in_uuid")
                            if (inUuid && inUuid === other.uuid.toString()) {
                                p.persistentData.remove("tp_in_uuid")
                                p.persistentData.remove("tp_in_type")
                                p.persistentData.remove("tp_in_time")
                                if (other.persistentData.getString("tp_out_uuid") === p.uuid.toString()) {
                                    other.persistentData.remove("tp_out_uuid")
                                    other.persistentData.remove("tp_out_type")
                                    other.persistentData.remove("tp_out_time")
                                }
                                cleared = true
                                p.tell(Text.gray("Denied teleport request from ").append(Text.white(other.username)))
                                other.tell(Text.yellow(p.username).append(Text.red(" denied your teleport request")))
                            }

                            if (!cleared) {
                                p.tell(Text.red("No matching teleport request found with that player"))
                                return 0
                            }

                            return 1
                        })
                    )
                )
                .executes(c => {
                    let p = c.source.getPlayer()
                    p.tell(Text.white("Missing something?").append(Text.yellow(" This command needs more arguments!")))
                    return 0
                })
            )


            .then(e.commands.literal("help")
            .executes(c => {
                let p = c.source.getPlayer()

                p.tell(Text.gold("Info about /go"))
                p.tell(Text.yellow("/go").append(Text.white(" is used to travel on the server to make your life easier! Each use of this command consumes -1n")))

                p.tell(Text.gray(""))

                p.tell(Text.white("/go spawn"))
                p.tell(Text.gray("・ Teleports you to a home you've set via /home set"))
                p.tell(Text.gray("⋯ ・ Alias: /spawn"))

                p.tell(Text.white("/go home"))
                p.tell(Text.gray("・ Teleports you to your home, one you've set via /home set"))
                p.tell(Text.gray("⋯ ・ Alias: /home go"))

                p.tell(Text.white("/go randomly"))
                p.tell(Text.gray("・ Randomly teleports you somewhere on the map. New players get 1 free use of this command"))
                p.tell(Text.gray("⋯ ・ Alias: /rtp"))

                p.tell(Text.white("/go tp to <@someone>"))
                p.tell(Text.gray("・ Sends someone a request that you want to teleport to them"))

                p.tell(Text.white("/go tp here <@someone>"))
                p.tell(Text.gray("・ Sends someone a request that you want them to teleport to you"))

                p.tell(Text.white("/go tp accept <@someone>"))
                p.tell(Text.gray("・ Accepts the someone's teleportation request to you"))

                p.tell(Text.white("/go tp deny <@someone>"))
                p.tell(Text.gray("・ Denies someone's teleportation request to you or from you to them"))

                return 1
            })    
            ).executes(c => {
                let p = c.source.getPlayer()
                p.tell(Text.white("Confused?").append(Text.yellow(" Use /go help for assistance")))
                return 1
            })
    )} else {
        e.register(
            e.commands.literal("go")
            .executes(c => {
                let p = c.source.getPlayer()

                p.tell(Text.gold("This command is only available on the server!"))
                p.tell(Text.white("Use the /home and /rtp commands instead"))
                return 0
            })
        )
    }
})