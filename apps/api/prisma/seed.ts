import { PrismaClient, NodeType, PlaybookStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type NodeDefinition = { title: string; script: string; suggestedQuestion?: string; type?: NodeType };
type SectionDefinition = { title: string; nodes: NodeDefinition[] };

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
    ],
  },
  {
    title: 'Leverage Wins',
    nodes: [
      { title: 'Bring the need forward', script: 'Since you said that solving those challenges was important, let me show you the option that best fits.' },
      { title: 'Feature', script: 'I recommend the NRS Pay solution and the products that meet the needs we identified.' },
      { title: 'Link', script: 'This is a strong fit because it addresses the specific problems you mentioned.' },
      { title: 'Benefit', script: "Explain the benefits using the customer's own must-haves and priorities." },
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
    ],
  },
  {
    title: 'Propuesta',
    nodes: [
      { title: 'Conectar con la necesidad', script: 'Como me comentó que resolver esos problemas es importante, permítame mostrarle la opción que mejor encaja.' },
      { title: 'Presentar la solución', script: 'Le recomiendo la solución NRS Pay y los productos que cubren las necesidades que identificamos.' },
      { title: 'Relacionar', script: 'Es una buena opción para usted porque responde directamente a los problemas que mencionó.' },
      { title: 'Explicar beneficios', script: 'Explique los beneficios usando las prioridades y necesidades del cliente.' },
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
  if (existing) return existing;
  return prisma.playbook.create({
    data: {
      ownerId,
      title: definition.title,
      description: 'Flujo estructurado a partir del archivo Copy of Outbound NRS SELLER.xlsx.',
      language: definition.language,
      industry: 'general',
      version: '1.0',
      status: PlaybookStatus.PUBLISHED,
      sections: {
        create: definition.sections.map((section, sectionIndex) => ({
          title: section.title,
          sortOrder: sectionIndex,
          nodes: { create: section.nodes.map((node, nodeIndex) => ({ ...node, suggestedQuestion: node.suggestedQuestion ?? '', type: node.type ?? NodeType.SCRIPT, sortOrder: nodeIndex })) },
        })),
      },
    },
    include: { sections: { include: { nodes: true } } },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'admin@salesplaybook.local' },
    update: {},
    create: { email: 'admin@salesplaybook.local', name: 'Sales Playbook Admin', passwordHash, role: 'ADMIN' },
  });
  const english = await createPlaybook(owner.id, { title: 'NRS Seller Call Flow', language: 'en', sections: englishSections });
  const spanish = await createPlaybook(owner.id, { title: 'NRS Seller Call Flow — Español', language: 'es', sections: spanishSections });
  console.log(`Seed complete: ${english.title}, ${spanish.title}`);
}

main().finally(() => prisma.$disconnect());
