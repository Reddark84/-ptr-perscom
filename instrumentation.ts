export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { garantirEsquema } = await import("./db/migrar");
      await garantirEsquema();
      const { seedIfEmpty } = await import("./db/seed");
      await seedIfEmpty();
      const { garantirComandoPrincipal } = await import("./lib/auth");
      await garantirComandoPrincipal();
      console.log("✓ PTR PERSCOM: base de dados verificada e conta de Comando garantida.");
    } catch (e) {
      console.error("Arranque: falha ao preparar a base de dados:", e);
    }
  }
}
