/*
    server script

    applies global attributes to all new and loaded in entities in worlds
    theres probably a way easier way to do this with entityjs but i dont use it

    optionally skips players
    by default turns max hp x4 and damage x1.5
*/


EntityEvents.spawned(e => {
    let m = e.getEntity()
    if (m.living == false) return
    if (m.persistentData.getBoolean("hped")) return
    if (m.type == "minecraft:player") return

    let Attributes = Java.loadClass("net.minecraft.world.entity.ai.attributes.Attributes")
    
    let modiflist = [
        { attribute: Attributes.MAX_HEALTH, multiplier: 4 },
        { attribute: Attributes.ATTACK_DAMAGE, multiplier: 1.5 }
    ]

    modiflist.forEach(mod => {
        let einstance = m["getAttribute(net.minecraft.core.Holder)"](mod.attribute)
        if (einstance == null) return
        einstance.setBaseValue(einstance.getBaseValue() * mod.multiplier)
    })

    m.setHealth(m.getMaxHealth())
    m.persistentData.putBoolean("hped", true)
})