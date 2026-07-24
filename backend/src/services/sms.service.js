const fetch = global.fetch || require("node-fetch");

/**
 * Service d'envoi de SMS, volontairement isolé derrière une seule fonction.
 * Remplacer l'implémentation interne par l'appel réel à Twilio / Nexmo /
 * l'API d'un opérateur local (MTN, Orange) sans toucher au reste du code.
 */
async function sendSms(phone, message) {
  if (process.env.NODE_ENV !== "production") {
    // En développement : pas d'appel réseau, on affiche simplement le message.
    console.log(`[SMS SIMULÉ] → ${phone} : ${message}`);
    return { success: true, simulated: true };
  }

  const response = await fetch(process.env.SMS_PROVIDER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SMS_PROVIDER_API_KEY}`,
    },
    body: JSON.stringify({ to: phone, text: message }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Échec de l'envoi SMS (${response.status}) : ${errorText}`);
  }

  return { success: true, simulated: false };
}

module.exports = { sendSms };
