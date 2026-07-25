const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporterPromise = null;

/**
 * Crée un transporteur SMTP.
 * - Si SMTP_* est défini → utilise ce serveur (Gmail, Mailtrap, etc.)
 * - Sinon → compte Ethereal éphémère (preview URL dans la console)
 */
async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (env.smtp.host && env.smtp.user && env.smtp.pass) {
      return nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.port === 465,
        auth: { user: env.smtp.user, pass: env.smtp.pass },
      });
    }

    const testAccount = await nodemailer.createTestAccount();
    console.log("[mail] Ethereal account created:", testAccount.user);
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  })();

  return transporterPromise;
}

async function sendMail({ to, subject, html, text }) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      text,
      html,
    });

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log(`[mail] Preview URL: ${preview}`);
    }
    return info;
  } catch (err) {
    // Ne bloque jamais le flux métier si l'email échoue
    console.error("[mail] Failed to send:", err.message);
    return null;
  }
}

function welcomeEmail(user) {
  return {
    to: user.email,
    subject: "Bienvenue sur ShopSphere 🛒",
    text: `Bonjour ${user.name},\n\nVotre compte ShopSphere a bien été créé.\nBonne shopping !\n`,
    html: `
      <h2>Bienvenue ${user.name} !</h2>
      <p>Votre compte <strong>ShopSphere</strong> a bien été créé.</p>
      <p>Vous pouvez dès maintenant parcourir le catalogue et passer commande.</p>
    `,
  };
}

function orderCreatedEmail(user, order) {
  return {
    to: user.email,
    subject: `Commande #${order.id.slice(0, 8)} confirmée`,
    text: `Bonjour ${user.name},\nVotre commande d'un montant de ${order.total.toFixed(2)} € a été créée (statut: ${order.status}).\n`,
    html: `
      <h2>Merci pour votre commande !</h2>
      <p>Bonjour ${user.name},</p>
      <p>Commande <strong>#${order.id.slice(0, 8)}</strong> — total <strong>${order.total.toFixed(2)} €</strong></p>
      <p>Statut actuel : <strong>${order.status}</strong></p>
    `,
  };
}

function orderStatusEmail(user, order) {
  return {
    to: user.email,
    subject: `Mise à jour commande #${order.id.slice(0, 8)} — ${order.status}`,
    text: `Bonjour ${user.name},\nLe statut de votre commande est passé à : ${order.status}.\n`,
    html: `
      <h2>Mise à jour de commande</h2>
      <p>Bonjour ${user.name},</p>
      <p>Votre commande <strong>#${order.id.slice(0, 8)}</strong> est maintenant : <strong>${order.status}</strong>.</p>
    `,
  };
}

function lowStockEmail(product) {
  return {
    to: env.smtp.from,
    subject: `[Alerte stock] ${product.name} — ${product.stock} restant(s)`,
    text: `Le produit "${product.name}" (id=${product.id}) a un stock bas : ${product.stock}.`,
    html: `
      <h2>Alerte stock bas</h2>
      <p>Produit : <strong>${product.name}</strong></p>
      <p>Stock restant : <strong>${product.stock}</strong></p>
    `,
  };
}

module.exports = {
  sendMail,
  welcomeEmail,
  orderCreatedEmail,
  orderStatusEmail,
  lowStockEmail,
};
