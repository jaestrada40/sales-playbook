import { PrismaClient, NodeType, PlaybookStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type NodeDefinition = { title: string; script: string; suggestedQuestion?: string; type?: NodeType };
type SectionDefinition = { title: string; nodes: NodeDefinition[] };

const englishDiscoveryQuestions = [
  'Is there anything you wish your POS could do?',
  'How is the service with your current provider?',
  'What made you choose your current provider?',
  'Do you have a website or eCommerce store?',
  'What is the biggest challenge you need to solve right now?',
  'How are you attracting new clients?',
  'What is your biggest frustration with your current processor or POS?',
  'How is that problem affecting your business growth?',
  'How are you addressing your current roadblocks?',
  'What do you currently like about your processor?',
  'Who is involved in the decision-making process?',
  'What timeline are you considering for a change?',
  'How do you keep up with your competitors?',
  'How can I make your business easier?',
  'Is there something specific you need assistance with today?',
  'Approximately how much do you process in credit cards each month?',
  'What features would improve your inventory management?',
  'Can you describe your current customer?',
  'How are you managing your business social media?',
  'What would you like to do that your current register cannot do?',
  'What would you like your POS system to do?',
  'Do you know anything about Cash Discount?',
  'How are you managing your taxes?',
  'How do you manage timeclock and payroll?',
  'How do you feel about your current processing fees?',
  'Do you know how to read your processing statement?',
  'What solutions do you use for EBT and eWIC?',
  'How do you like your delivery and terminal experience?',
  'What dreams do you have for your business and life?',
].map((question) => ({ title: question, script: question, suggestedQuestion: question, type: NodeType.QUESTION }));

const spanishDiscoveryQuestions = [
  '¿Hay algo que le gustaría que hiciera su POS?',
  '¿Cómo es el servicio con su proveedor actual?',
  '¿Qué lo hizo elegir a su proveedor actual?',
  '¿Tiene un sitio web o tienda de comercio electrónico?',
  '¿Cuál es el mayor reto que necesita resolver ahora?',
  '¿Cómo está consiguiendo nuevos clientes?',
  '¿Cuál es su mayor frustración con su procesador o POS actual?',
  '¿Cómo está afectando ese problema al crecimiento de su negocio?',
  '¿Cómo está resolviendo actualmente sus obstáculos?',
  '¿Qué es lo que más le gusta de su procesador actual?',
  '¿Quién participa en la decisión de cambiar?',
  '¿Qué plazo está considerando para hacer un cambio?',
  '¿Cómo se mantiene competitivo frente a otros negocios?',
  '¿Cómo podría facilitarle la operación de su negocio?',
  '¿Hay algo específico en lo que le gustaría recibir ayuda hoy?',
  'Aproximadamente, ¿cuánto procesa al mes en ventas con tarjeta?',
  '¿Qué funciones mejorarían el manejo de su inventario?',
  '¿Cómo describiría a sus clientes actuales?',
  '¿Cómo administra las redes sociales de su negocio?',
  '¿Qué le gustaría hacer que su caja registradora actual no permite?',
  '¿Qué le gustaría que hiciera su sistema POS?',
  '¿Conoce el programa de Cash Discount?',
  '¿Cómo maneja actualmente sus impuestos?',
  '¿Cómo administra el control de horarios y la nómina?',
  '¿Qué opina de las comisiones de su proveedor actual?',
  '¿Sabe cómo leer su estado de cuenta de procesamiento?',
  '¿Qué solución utiliza para EBT y eWIC?',
  '¿Qué le parece el funcionamiento de su terminal?',
  '¿Cuáles son sus metas o sueños para su negocio y su vida?',
].map((question) => ({ title: question, script: question, suggestedQuestion: question, type: NodeType.QUESTION }));

const englishSections: SectionDefinition[] = [
  {
    title: 'Set the Tone',
    nodes: [
      { title: 'Introduce yourself', script: "Hi, how are you today? My name is Lourdes. I'm a Payment Consultant with NRS Pay, and this is a recorded line." },
      { title: 'State the purpose', script: "I'm calling local businesses to share information about our no-fee processing program that helps businesses save money every month.", suggestedQuestion: 'Are you the store owner or manager?' },
      { title: 'Set the hook', script: 'With NRS Pay you can keep 100% of your sales, with next-day deposits, 24/7 support in English and Spanish, and no long-term contract.' },
      { title: 'Transition', script: 'With that in mind, let me find out which option is best for you.' },
    ],
  },
  {
    title: 'Examine Needs',
    nodes: [
      { title: 'Qualify the customer', script: 'Great, before I recommend anything, let me ask a couple of quick questions so I can understand your business better. Is that okay?', suggestedQuestion: 'Do you currently have a POS system?' },
      { title: 'Discover the current situation', script: 'Listen for wants, interest and needs. Do not ask every question; choose the questions that fit the conversation.', suggestedQuestion: 'What is the biggest frustration with your current processor or POS?' },
      { title: 'Explore the business', script: 'Understand the operation, growth plans and decision process.', suggestedQuestion: 'What would you like your POS system to do that it does not do today?' },
      { title: 'Understand fees', script: "Clarify the customer's current processing experience and identify hidden fees or contract concerns.", suggestedQuestion: 'How do you feel about the fees your current provider is charging you?' },
      { title: 'Restate and check understanding', script: 'So, it sounds like having the must-haves we discussed is important. Do I have that right?' },
      ...englishDiscoveryQuestions,
    ],
  },
  {
    title: 'Leverage Wins',
    nodes: [
      { title: 'Bring the need forward', script: 'Since you said that solving those challenges was important, let me show you the option that best fits.' },
      { title: 'Feature', script: 'I recommend the NRS Pay solution and the products that meet the needs we identified.' },
      { title: 'Link', script: 'This is a strong fit because it addresses the specific problems you mentioned.' },
      { title: 'Benefit', script: "Explain the benefits using the customer's own must-haves and priorities." },
      { title: 'Clover path', script: 'If the customer uses Clover, discuss integration, reporting, terminal reliability and a smoother upgrade path.' },
      { title: 'Square path', script: 'If the customer uses Square, compare support, pricing, deposits and the operational features they need.' },
      { title: 'EBT and eWIC path', script: 'If EBT or eWIC is important, explain the available acceptance and reporting options.' },
      { title: 'Cash Discount path', script: 'If Cash Discount is relevant, explain the card service fee and cash discount clearly and compliantly.' },
      { title: 'Fees objection path', script: 'If fees are the objection, review the statement, identify hidden costs and connect the recommendation to the savings.' },
    ],
  },
  {
    title: 'Lock the Sale',
    nodes: [
      { title: 'Assumptive close', script: 'Let me just verify your address so we can prepare the next step.' },
      { title: 'Explain the next step', script: "Here's what I'm going to do, and then I will need you to confirm the details." },
      { title: 'Close the sale', script: "Let's go ahead and process your order.", type: NodeType.OUTCOME },
    ],
  },
  {
    title: 'Ease Concerns',
    nodes: [
      { title: 'Clarify and listen', script: 'Help me understand. I thought we agreed this solution would best meet your needs. What is causing your hesitation?', type: NodeType.OBJECTION },
      { title: 'Restate the concern', script: 'I understand that reason is a concern. Let me address it and show you how we can help.', type: NodeType.OBJECTION },
      { title: 'Isolate the primary objection', script: 'Other than that hesitation, was there anything else? Of those reasons, which is most important?', type: NodeType.OBJECTION },
      { title: 'Return to the close', script: "With that in mind, let's get the order started.", type: NodeType.OUTCOME },
    ],
  },
  {
    title: 'Recap',
    nodes: [
      { title: 'Button up', script: "Recap the agreed solution, the customer's main needs and the next step." },
      { title: 'Motivate to use', script: "I can't wait for you to start running your business with NRS." },
      { title: 'Brand the interaction', script: 'Thank you for choosing NRS! Have a great day.', type: NodeType.OUTCOME },
    ],
  },
];

const spanishSections: SectionDefinition[] = [
  {
    title: 'Apertura',
    nodes: [
      { title: 'Presentarse', script: 'Hola, ¿cómo está hoy? Mi nombre es Lourdes de NRS y esta llamada está siendo grabada. Ayudamos a los negocios locales a reducir o eliminar los costos por procesamiento de tarjetas.' },
      { title: 'Explicar el propósito', script: 'Seré breve. Estoy llamando a negocios de la zona para compartir información sobre nuestro programa de procesamiento sin cargos adicionales.', suggestedQuestion: '¿Es usted el dueño o gerente de la tienda?' },
      { title: 'Crear interés', script: 'Con NRS Pay puede conservar el 100% de sus ventas, recibir depósitos al siguiente día y tener soporte 24/7 en inglés y español.' },
      { title: 'Transición', script: 'Con eso en mente, permítame descubrir qué opción es mejor para usted.' },
    ],
  },
  {
    title: 'Descubrimiento',
    nodes: [
      { title: 'Calificar al cliente', script: 'Antes de recomendarle una solución, me gustaría hacerle un par de preguntas rápidas para entender mejor su negocio. ¿Le parece bien?', suggestedQuestion: '¿Actualmente cuenta con un sistema POS?' },
      { title: 'Explorar el negocio', script: 'Escuche deseos, intereses y necesidades. Seleccione las preguntas que correspondan a la conversación.', suggestedQuestion: '¿Cuál es el mayor reto que enfrenta en este momento?' },
      { title: 'Entender el sistema actual', script: 'Identifique limitaciones, oportunidades y lo que el cliente quiere mejorar.', suggestedQuestion: '¿Qué le gustaría que hiciera su sistema POS?' },
      { title: 'Entender las comisiones', script: 'Explore la experiencia actual con el procesador y las posibles comisiones ocultas.', suggestedQuestion: '¿Qué opina de las comisiones que le cobra su proveedor actual?' },
      { title: 'Confirmar necesidades', script: 'Entonces, lo más importante para usted es resolver esas necesidades. ¿Lo entendí correctamente?' },
      ...spanishDiscoveryQuestions,
    ],
  },
  {
    title: 'Propuesta',
    nodes: [
      { title: 'Conectar con la necesidad', script: 'Como me comentó que resolver esos problemas es importante, permítame mostrarle la opción que mejor encaja.' },
      { title: 'Presentar la solución', script: 'Le recomiendo la solución NRS Pay y los productos que cubren las necesidades que identificamos.' },
      { title: 'Relacionar', script: 'Es una buena opción para usted porque responde directamente a los problemas que mencionó.' },
      { title: 'Explicar beneficios', script: 'Explique los beneficios usando las prioridades y necesidades del cliente.' },
      { title: 'Ruta Clover', script: 'Si el cliente usa Clover, hable de integración, reportes, confiabilidad de terminales y una actualización sencilla.' },
      { title: 'Ruta Square', script: 'Si el cliente usa Square, compare soporte, precios, depósitos y las funciones que necesita.' },
      { title: 'Ruta EBT y eWIC', script: 'Si EBT o eWIC es importante, explique las opciones de aceptación y reportes disponibles.' },
      { title: 'Ruta Cash Discount', script: 'Si Cash Discount es relevante, explique claramente el cargo por servicio de tarjeta y el descuento en efectivo.' },
      { title: 'Ruta objeción de comisiones', script: 'Si la objeción son las comisiones, revise el estado de cuenta, identifique costos ocultos y conecte la recomendación con el ahorro.' },
    ],
  },
  {
    title: 'Cierre',
    nodes: [
      { title: 'Cierre asumido', script: 'Permítame verificar su dirección para preparar el siguiente paso.' },
      { title: 'Explicar siguiente paso', script: 'Esto es lo que voy a hacer y después necesitaré que confirme los datos.' },
      { title: 'Procesar la orden', script: 'Sigamos adelante y procesemos su orden.', type: NodeType.OUTCOME },
    ],
  },
  {
    title: 'Objeciones',
    nodes: [
      { title: 'Aclarar y escuchar', script: 'Ayúdeme a entender. Pensé que acordamos que esta solución cubriría sus necesidades. ¿Qué está causando su duda?', type: NodeType.OBJECTION },
      { title: 'Reformular la preocupación', script: 'Entiendo que eso sea una preocupación. Permítame explicarle cómo podemos ayudarle.', type: NodeType.OBJECTION },
      { title: 'Aislar la objeción', script: 'Además de esa duda, ¿hay algo más? ¿Cuál de las razones es la más importante?', type: NodeType.OBJECTION },
      { title: 'Volver al cierre', script: 'Con eso en mente, comencemos con la orden.', type: NodeType.OUTCOME },
    ],
  },
  {
    title: 'Recapitulación',
    nodes: [
      { title: 'Confirmar acuerdos', script: 'Repase la solución acordada, las necesidades principales y el siguiente paso.' },
      { title: 'Motivar', script: 'Me da mucho gusto que pronto pueda comenzar a operar su negocio con NRS.' },
      { title: 'Cerrar la interacción', script: '¡Gracias por elegir NRS! Que tenga un excelente día.', type: NodeType.OUTCOME },
    ],
  },
];

async function createPlaybook(ownerId: string, definition: { title: string; language: string; sections: SectionDefinition[] }) {
  const existing = await prisma.playbook.findFirst({ where: { ownerId, title: definition.title } });
  const sections = {
    create: definition.sections.map((section, sectionIndex) => ({
      title: section.title,
      sortOrder: sectionIndex,
      nodes: { create: section.nodes.map((node, nodeIndex) => ({ ...node, suggestedQuestion: node.suggestedQuestion ?? '', type: node.type ?? NodeType.SCRIPT, sortOrder: nodeIndex })) },
    })),
  };
  if (existing) {
    await prisma.playbookSection.deleteMany({ where: { playbookId: existing.id } });
    return prisma.playbook.update({ where: { id: existing.id }, data: { language: definition.language, version: '1.1', status: PlaybookStatus.PUBLISHED, sections }, include: { sections: { include: { nodes: true } } } });
  }
  return prisma.playbook.create({ data: { ownerId, title: definition.title, description: 'Flujo estructurado a partir del archivo Copy of Outbound NRS SELLER.xlsx.', language: definition.language, industry: 'general', version: '1.0', status: PlaybookStatus.PUBLISHED, sections }, include: { sections: { include: { nodes: true } } } });
}

async function createFlowBranches(playbook: { sections: Array<{ nodes: Array<{ id: string; title: string }> }> }) {
  const branches = playbook.sections.slice(0, -1).flatMap((section, index) => {
    const source = section.nodes.at(-1);
    const target = playbook.sections[index + 1]?.nodes[0];
    return source && target ? [{ sourceNodeId: source.id, targetNodeId: target.id, customerResponse: 'Cliente acepta continuar' }] : [];
  });
  const nodes = playbook.sections.flatMap((section) => section.nodes);
  const source = nodes.find((node) => node.title === 'Qualify the customer' || node.title === 'Calificar al cliente');
  const targets = [
    ['Clover', 'Clover path', 'Ruta Clover'],
    ['Square', 'Square path', 'Ruta Square'],
    ['EBT / eWIC', 'EBT and eWIC path', 'Ruta EBT y eWIC'],
    ['Cash Discount', 'Cash Discount path', 'Ruta Cash Discount'],
    ['Fees / hidden fees', 'Fees objection path', 'Ruta objeción de comisiones'],
  ];
  if (source) {
    for (const [response, englishTitle, spanishTitle] of targets) {
      const target = nodes.find((node) => node.title === englishTitle || node.title === spanishTitle);
      if (target) branches.push({ sourceNodeId: source.id, targetNodeId: target.id, customerResponse: response });
    }
  }
  const close = nodes.find((node) => node.title === 'Close the Sale' || node.title === 'Procesar la orden');
  const concern = nodes.find((node) => node.title === 'Clarify and listen' || node.title === 'Aclarar y escuchar');
  const recap = nodes.find((node) => node.title === 'Button up' || node.title === 'Confirmar acuerdos');
  if (close && concern) branches.push({ sourceNodeId: close.id, targetNodeId: concern.id, customerResponse: 'No / Tiene objeciones' });
  if (close && recap) branches.push({ sourceNodeId: close.id, targetNodeId: recap.id, customerResponse: 'Sí / Acepta continuar' });
  if (branches.length) await prisma.nodeBranch.createMany({ data: branches });
}

async function seedKnowledge(ownerId: string) {
  await prisma.knowledgeItem.deleteMany({ where: { ownerId, category: { in: ['voicemail', 'funding'] } } });
  await prisma.knowledgeItem.createMany({ data: [
    { ownerId, type: 'script', category: 'voicemail', language: 'en', title: 'Voicemail — Lower prices', content: 'We can help your business lower payment processing costs with a POS system.', tags: ['prices', 'pos'] },
    { ownerId, type: 'script', category: 'voicemail', language: 'en', title: 'Voicemail — Growth business', content: 'We help growing businesses improve operations and save money with a POS system.', tags: ['growth', 'pos'] },
    { ownerId, type: 'script', category: 'voicemail', language: 'en', title: 'Voicemail — Inventory management', content: 'We can help improve inventory management and make your operation easier with a POS system.', tags: ['inventory', 'pos'] },
    { ownerId, type: 'script', category: 'voicemail', language: 'en', title: 'Voicemail — More profits', content: 'We help businesses improve profits through eCommerce, loyalty, promotions and delivery integrations.', tags: ['profits', 'ecommerce', 'loyalty'] },
    { ownerId, type: 'script', category: 'voicemail', language: 'es', title: 'Buzón de voz — NRS', content: 'Hola, le habla Lourdes de NRS. Le llamo porque podemos ayudar a su negocio a ahorrar dinero en el procesamiento de pagos con tarjeta. Cuando tenga un momento, por favor devuélvame la llamada al 833-289-2767, extensión 0178. Muchas gracias y que tenga un excelente día.', tags: ['voicemail', 'ahorro'] },
    { ownerId, type: 'script', category: 'voicemail', language: 'en', title: 'Voicemail — NRS', content: 'Hi, this is Lourdes with NRS. I am calling because we can help your business save money on payment processing. Please call me back at 833-289-2767, extension 0178. Thank you, and have a great day!', tags: ['voicemail', 'savings'] },
    { ownerId, type: 'product', category: 'funding', language: 'en', title: 'NRS Funding — Seller script', content: 'We help businesses get fast funding with minimal paperwork. Funding can help with expansion, inventory, equipment, renovations, payroll, another location or cash flow. We offer funding from $2,500 up to $500,000, with options available as soon as the next business day. Required documents: last 3 months of payment processor statements and last 3 months of business bank statements.', tags: ['funding', 'cash-flow', 'inventory'] },
    { ownerId, type: 'product', category: 'funding', language: 'es', title: 'NRS Funding — Guion en español', content: 'Ayudamos a negocios a obtener capital de trabajo mediante un proceso sencillo. Puede utilizarse para inventario, equipo, remodelaciones, nómina, otra sucursal o flujo de efectivo. Ofrecemos financiamiento desde $2,500 hasta $500,000, con opciones disponibles desde el siguiente día hábil si califica. Requisitos: últimos 3 meses de estados del procesador y últimos 3 meses de estados bancarios del negocio.', tags: ['financiamiento', 'flujo', 'inventario'] },
  ] });
}

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'admin@salesplaybook.local' },
    update: {},
    create: { email: 'admin@salesplaybook.local', name: 'Sales Playbook Admin', passwordHash, role: 'ADMIN' },
  });
  const team = (await prisma.team.findFirst({ where: { name: 'NRS Sales' } })) ?? await prisma.team.create({ data: { name: 'NRS Sales' } });
  await prisma.user.update({ where: { id: owner.id }, data: { teamId: team.id } });
  const english = await createPlaybook(owner.id, { title: 'NRS Seller Call Flow', language: 'en', sections: englishSections });
  await createFlowBranches(english);
  const spanish = await createPlaybook(owner.id, { title: 'NRS Seller Call Flow — Español', language: 'es', sections: spanishSections });
  await createFlowBranches(spanish);
  await seedKnowledge(owner.id);
  const campaign = (await prisma.campaign.findFirst({ where: { name: 'NRS Outbound', teamId: team.id } })) ?? await prisma.campaign.create({ data: { name: 'NRS Outbound', description: 'Campaña de llamadas salientes basada en el playbook NRS Seller.', direction: 'OUTBOUND', status: 'ACTIVE', teamId: team.id, managerId: owner.id, playbookId: english.id, dailyCallGoal: 20 } });
  await prisma.complianceSettings.upsert({ where: { jurisdiction: 'DEFAULT' }, create: { jurisdiction: 'DEFAULT', timezone: 'America/New_York', callingStartHour: 9, callingEndHour: 20, retentionDays: 365, requireConsent: true, recordingEnabled: false }, update: { recordingEnabled: false } });
  console.log(`Seed complete: ${english.title}, ${spanish.title}`);
}

main().finally(() => prisma.$disconnect());
