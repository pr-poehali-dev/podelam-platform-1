export type CourseOffer = {
  id: string;
  matchProfessions: string[];
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  image: string;
  priceOriginal: number;
  priceDiscount: number;
  discountPercent: number;
  promoCode: string;
  promoTtlMinutes: number;
  linkDetails: string;
  linkBuy: string;
};

export const COURSE_OFFERS: CourseOffer[] = [
  {
    id: "massage-basics",
    matchProfessions: [
      "Массажист / телесный терапевт",
    ],
    title: "Основы массажа: Первые шаги",
    subtitle: "Онлайн-курс с сертификатом",
    description: `Рынок массажных услуг в России растёт каждый год — клиенты всё чаще выбирают специалистов не просто с опытом, а с глубокими знаниями анатомии, диагностики и современных техник. Именно поэтому мы подобрали для вас профессиональный и проверенный курс от практикующих специалистов.

Курс «Основы массажа: Первые шаги» — это полноценное обучение с нуля, которое подходит даже тем, у кого нет медицинского образования. Вы освоите не только классический массаж, но и углублённые методики: медицинский массаж, постизометрическую релаксацию (ПИР), висцеральные и мануальные техники, которые интегрируются в каждый сеанс.

Программа включает теоретическую базу, видеоразборы техник, диагностику состояний клиента и практические протоколы работы. После прохождения вы получите сертификат, подтверждающий вашу квалификацию.`,
    features: [
      "Без медицинского образования — доступно каждому",
      "Медицинский массаж и классические техники",
      "ПИР (постизометрическая релаксация)",
      "Висцеральные техники для работы с внутренними органами",
      "Мануальные техники, адаптированные в сеанс массажа",
      "Видеоуроки с разбором каждой техники",
      "Диагностика состояний клиента",
      "Теоретическая база анатомии и физиологии",
      "Доступ к материалам навсегда",
      "Бонусные модули и дополнительные материалы",
      "Сертификат после прохождения курса",
    ],
    image: "https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/e365dd8d-df24-48d0-a4a4-4ceb30304cae.jpg",
    priceOriginal: 25590,
    priceDiscount: 7700,
    discountPercent: 70,
    promoCode: "PO70Delam",
    promoTtlMinutes: 30,
    linkDetails: "https://docdialog.su/basics-course",
    linkBuy: "https://school.brossok.ru/buy/15",
  },
];

export function findCourseForProfession(selectedProf: string): CourseOffer | null {
  return COURSE_OFFERS.find((c) =>
    c.matchProfessions.some((p) => selectedProf.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(selectedProf.toLowerCase()))
  ) ?? null;
}
