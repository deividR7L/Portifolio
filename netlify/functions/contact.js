const RESEND_API_URL = "https://api.resend.com/emails";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_LENGTH = {
  nome: 100,
  email: 180,
  telefone: 60,
  mensagem: 2500,
};

function getHeader(headers, key) {
  if (!headers) return "";
  return headers[key] || headers[key.toLowerCase()] || "";
}

function decodeBody(body, isBase64Encoded) {
  if (!body) return "";
  if (isBase64Encoded) {
    return Buffer.from(body, "base64").toString("utf8");
  }
  return body;
}

function parsePayload(event) {
  const contentType = String(getHeader(event.headers, "content-type")).toLowerCase();
  const rawBody = decodeBody(event.body, event.isBase64Encoded);

  if (!rawBody) return {};

  if (contentType.includes("application/json")) {
    return JSON.parse(rawBody);
  }

  const params = new URLSearchParams(rawBody);
  return Object.fromEntries(params.entries());
}

function normalizeField(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlRedirect(location) {
  return {
    statusCode: 303,
    headers: { Location: location },
    body: "",
  };
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  };
}

function prefersHtml(event) {
  const accept = String(getHeader(event && event.headers, "accept")).toLowerCase();
  return accept.includes("text/html");
}

function validateInput(fields) {
  const nome = normalizeField(fields.nome);
  const email = normalizeField(fields.email).toLowerCase();
  const telefone = normalizeField(fields.telefone);
  const mensagem = normalizeField(fields.mensagem);

  if (!nome || !email || !mensagem) {
    return { ok: false, message: "Preencha nome, e-mail e mensagem." };
  }

  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "E-mail invalido." };
  }

  if (nome.length > MAX_LENGTH.nome) {
    return { ok: false, message: "Nome muito longo." };
  }

  if (email.length > MAX_LENGTH.email) {
    return { ok: false, message: "E-mail muito longo." };
  }

  if (telefone.length > MAX_LENGTH.telefone) {
    return { ok: false, message: "Telefone muito longo." };
  }

  if (mensagem.length > MAX_LENGTH.mensagem) {
    return { ok: false, message: "Mensagem muito longa." };
  }

  return { ok: true, data: { nome, email, telefone, mensagem } };
}

async function sendResendEmail(apiKey, payload) {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(`Resend error ${response.status}: ${raw}`);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    if (prefersHtml(event)) {
      return htmlRedirect("/index.html?status=erro#contato");
    }
    return jsonResponse(405, { ok: false, message: "Method not allowed." });
  }

  let fields;
  try {
    fields = parsePayload(event);
  } catch {
    if (prefersHtml(event)) {
      return htmlRedirect("/index.html?status=erro#contato");
    }
    return jsonResponse(400, { ok: false, message: "Payload invalido." });
  }

  const honeypot = normalizeField(fields["bot-field"]);
  if (honeypot) {
    return jsonResponse(200, { ok: true });
  }

  const validation = validateInput(fields);
  if (!validation.ok) {
    if (prefersHtml(event)) {
      return htmlRedirect("/index.html?status=erro#contato");
    }
    return jsonResponse(400, { ok: false, message: validation.message });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const contactTo = process.env.CONTACT_TO_EMAIL || "davimelgasso7l@icloud.com";
  const contactFrom = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";
  const autoReplyEnabled = process.env.CONTACT_AUTOREPLY_ENABLED === "true";

  if (!apiKey) {
    console.error("Missing RESEND_API_KEY");
    if (prefersHtml(event)) {
      return htmlRedirect("/index.html?status=erro#contato");
    }
    return jsonResponse(500, { ok: false, message: "Email service not configured." });
  }

  const { nome, email, telefone, mensagem } = validation.data;
  const safeNome = escapeHtml(nome);
  const safeEmail = escapeHtml(email);
  const safeTelefone = escapeHtml(telefone || "Nao informado");
  const safeMensagem = escapeHtml(mensagem).replace(/\n/g, "<br>");

  try {
    await sendResendEmail(apiKey, {
      from: contactFrom,
      to: [contactTo],
      reply_to: email,
      subject: `Novo contato do portfolio - ${nome}`,
      html: `
        <h2>Novo contato recebido</h2>
        <p><strong>Nome:</strong> ${safeNome}</p>
        <p><strong>E-mail:</strong> ${safeEmail}</p>
        <p><strong>Telefone:</strong> ${safeTelefone}</p>
        <p><strong>Mensagem:</strong><br>${safeMensagem}</p>
      `,
      text: `Novo contato recebido\n\nNome: ${nome}\nE-mail: ${email}\nTelefone: ${
        telefone || "Nao informado"
      }\n\nMensagem:\n${mensagem}`,
    });

    if (autoReplyEnabled) {
      await sendResendEmail(apiKey, {
        from: contactFrom,
        to: [email],
        subject: "Recebemos sua mensagem",
        html: `
          <p>Oi, ${safeNome}.</p>
          <p>Recebi sua mensagem e vou te responder em ate 24 horas uteis.</p>
          <p>Obrigado pelo contato.</p>
        `,
        text: `Oi, ${nome}. Recebi sua mensagem e vou te responder em ate 24 horas uteis. Obrigado pelo contato.`,
      });
    }
  } catch (error) {
    console.error("Contact function failed:", error);
    if (prefersHtml(event)) {
      return htmlRedirect("/index.html?status=erro#contato");
    }
    return jsonResponse(502, { ok: false, message: "Falha ao enviar email." });
  }

  if (prefersHtml(event)) {
    return htmlRedirect("/obrigado.html");
  }

  return jsonResponse(200, { ok: true });
};
