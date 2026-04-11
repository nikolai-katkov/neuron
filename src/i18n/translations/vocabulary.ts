import type { VocabularyCategory } from '../../types'
import type { Language } from '../types'

const VOCABULARY_EN: VocabularyCategory[] = [
  {
    id: 'toys',
    sectionId: 'tact',
    name: 'Toys',
    words: {
      simple: [
        'ball',
        'doll',
        'block',
        'toy car',
        'teddy bear',
        'spinning top',
        'balloon',
        'small ball',
        'toy animal',
        'baby doll',
      ],
      medium: [
        'stacking rings',
        'building set',
        'train',
        'robot',
        'puzzle',
        'toy horse',
        'garage',
        'track',
        'drum',
        'xylophone',
      ],
      complex: [
        'transformer',
        'maze',
        'remote-control car',
        'tool set',
        'interactive toy',
        'superhero figure',
        'board game',
      ],
    },
  },
  {
    id: 'shapes',
    sectionId: 'tact',
    name: 'Shapes',
    words: {
      simple: ['circle', 'square', 'triangle', 'sphere', 'cube', 'line', 'dot'],
      medium: ['oval', 'rectangle', 'star', 'heart', 'diamond', 'cross', 'semicircle'],
      complex: ['trapezoid', 'cylinder', 'cone', 'prism', 'polygon', 'parallelogram', 'sector'],
    },
  },
  {
    id: 'fruits',
    sectionId: 'tact',
    name: 'Fruits',
    words: {
      simple: ['apple', 'banana', 'pear', 'plum', 'grape', 'orange', 'tangerine', 'peach'],
      medium: ['apricot', 'lemon', 'kiwi', 'pineapple', 'nectarine', 'lime', 'pomelo'],
      complex: ['pomegranate', 'mango', 'papaya', 'persimmon', 'fig', 'avocado', 'passion fruit'],
    },
  },
  {
    id: 'body-parts',
    sectionId: 'tact',
    name: 'Body Parts',
    words: {
      simple: ['head', 'arm', 'leg', 'eye', 'nose', 'mouth', 'ear', 'tooth'],
      medium: ['finger', 'shoulder', 'elbow', 'knee', 'tummy', 'back', 'neck'],
      complex: ['wrist', 'ankle', 'chin', 'ankle bone', 'heel', 'chest', 'lower back'],
    },
  },
  {
    id: 'domestic-animals',
    sectionId: 'tact',
    name: 'Domestic Animals',
    words: {
      simple: ['cat', 'dog', 'cow', 'goat', 'horse', 'sheep', 'chicken'],
      medium: ['rabbit', 'hamster', 'piglet', 'calf', 'kitten', 'puppy', 'duck'],
      complex: ['donkey', 'nutria', 'guinea pig', 'chinchilla', 'pony', 'turkey'],
    },
  },
  {
    id: 'vegetables',
    sectionId: 'tact',
    name: 'Vegetables',
    words: {
      simple: ['potato', 'carrot', 'cucumber', 'tomato', 'cabbage', 'onion', 'garlic'],
      medium: ['beet', 'zucchini', 'radish', 'pepper', 'pumpkin', 'pea', 'corn'],
      complex: ['eggplant', 'broccoli', 'cauliflower', 'celery', 'asparagus', 'artichoke'],
    },
  },
  {
    id: 'forest-animals',
    sectionId: 'tact',
    name: 'Forest Animals',
    words: {
      simple: ['hare', 'fox', 'wolf', 'bear', 'squirrel', 'hedgehog'],
      medium: ['moose', 'wild boar', 'beaver', 'badger', 'marten', 'otter'],
      complex: ['wolverine', 'lynx', 'chipmunk', 'mink', 'ermine', 'jerboa'],
    },
  },
  {
    id: 'clothing',
    sectionId: 'tact',
    name: 'Clothing',
    words: {
      simple: ['tank top', 'shirt', 'dress', 'skirt', 'sweater', 'hat', 't-shirt'],
      medium: ['pants', 'jacket', 'socks', 'pullover', 'scarf', 'mittens', 'jeans'],
      complex: ['vest', 'jumpsuit', 'raincoat', 'cardigan', 'pajamas', 'bathrobe'],
    },
  },
  {
    id: 'footwear',
    sectionId: 'tact',
    name: 'Footwear',
    words: {
      simple: ['shoes', 'boots', 'tall boots', 'sneakers', 'slippers', 'sandals'],
      medium: ['high-tops', 'felt boots', 'open-toe sandals', 'moccasins', 'flip-flops', 'slides'],
      complex: ['ankle boots', 'cleats', 'loafers', 'ugg boots', 'ballet flats'],
    },
  },
  {
    id: 'furniture',
    sectionId: 'tact',
    name: 'Furniture',
    words: {
      simple: ['table', 'chair', 'bed', 'wardrobe', 'sofa', 'shelf', 'armchair'],
      medium: ['nightstand', 'dresser', 'stool', 'bench', 'mirror', 'cabinet'],
      complex: ['buffet', 'china cabinet', 'bookcase', 'display shelf', 'vanity'],
    },
  },
  {
    id: 'dishes',
    sectionId: 'tact',
    name: 'Dishes',
    words: {
      simple: ['cup', 'plate', 'spoon', 'fork', 'mug', 'bowl'],
      medium: ['knife', 'glass', 'pot', 'pan', 'kettle', 'saucer'],
      complex: ['colander', 'ladle', 'wine glass', 'dipper', 'salad bowl'],
    },
  },
  {
    id: 'food',
    sectionId: 'tact',
    name: 'Food',
    words: {
      simple: ['bread', 'soup', 'porridge', 'cheese', 'egg', 'juice', 'water'],
      medium: ['milk', 'yogurt', 'cookie', 'candy', 'pasta', 'cutlet'],
      complex: ['omelet', 'casserole', 'pastry', 'sandwich', 'jam'],
    },
  },
  {
    id: 'transport',
    sectionId: 'tact',
    name: 'Transport',
    words: {
      simple: ['car', 'bus', 'train', 'airplane', 'bicycle', 'boat'],
      medium: ['tram', 'truck', 'motorcycle', 'subway', 'taxi', 'ship'],
      complex: ['helicopter', 'bulldozer', 'excavator', 'trolleybus', 'tractor'],
    },
  },
  {
    id: 'school-supplies',
    sectionId: 'tact',
    name: 'School Supplies',
    words: {
      simple: ['pen', 'pencil', 'book', 'notebook', 'backpack', 'sketchbook'],
      medium: ['ruler', 'pencil case', 'marker', 'glue', 'brush', 'paints'],
      complex: ['compass', 'sharpener', 'book cover', 'bookmark', 'scissors'],
    },
  },
  {
    id: 'appliances',
    sectionId: 'tact',
    name: 'Appliances',
    words: {
      simple: ['phone', 'television', 'lamp', 'iron', 'hair dryer'],
      medium: ['computer', 'electric kettle', 'microwave', 'fan', 'laptop'],
      complex: ['blender', 'printer', 'air conditioner', 'dishwasher', 'heater'],
    },
  },
  {
    id: 'sports-equipment',
    sectionId: 'tact',
    name: 'Sports Equipment',
    words: {
      simple: ['ball', 'jump rope', 'hoop', 'bowling pins'],
      medium: ['skates', 'dumbbells', 'hockey stick', 'racket', 'net'],
      complex: ['exercise machine', 'resistance band', 'helmet', 'hurdle'],
    },
  },
  {
    id: 'berries',
    sectionId: 'tact',
    name: 'Berries',
    words: {
      simple: ['raspberry', 'strawberry', 'blueberry', 'cherry'],
      medium: ['blackberry', 'cranberry', 'bilberry', 'lingonberry'],
      complex: ['cloudberry', 'mulberry', 'sea buckthorn', 'rowan berry'],
    },
  },
  {
    id: 'domestic-birds',
    sectionId: 'tact',
    name: 'Domestic Birds',
    words: {
      simple: ['chicken', 'duck', 'goose', 'rooster'],
      medium: ['turkey', 'chick', 'duckling', 'gosling'],
      complex: ['guinea fowl', 'drake', 'pheasant', 'peacock'],
    },
  },
  {
    id: 'wild-birds',
    sectionId: 'tact',
    name: 'Wild Birds',
    words: {
      simple: ['sparrow', 'pigeon', 'crow', 'magpie'],
      medium: ['woodpecker', 'seagull', 'swan', 'bullfinch'],
      complex: ['eagle', 'hawk', 'crane', 'stork'],
    },
  },
  {
    id: 'fish',
    sectionId: 'tact',
    name: 'Fish',
    words: {
      simple: ['fish', 'perch', 'pike', 'crucian carp'],
      medium: ['carp', 'trout', 'pike-perch', 'herring'],
      complex: ['shark', 'ray', 'eel', 'flounder'],
    },
  },
  {
    id: 'trees-flowers',
    sectionId: 'tact',
    name: 'Trees & Flowers',
    words: {
      simple: ['tree', 'birch', 'fir tree', 'oak', 'rose'],
      medium: ['maple', 'linden', 'daisy', 'lily', 'cornflower'],
      complex: ['orchid', 'acacia', 'chrysanthemum', 'lilac'],
    },
  },
  {
    id: 'headwear',
    sectionId: 'tact',
    name: 'Headwear',
    words: {
      simple: ['hat', 'cap', 'sun hat', 'panama hat'],
      medium: ['beret', 'bandana', 'headscarf', 'fur hat'],
      complex: ['top hat', 'peaked cap', 'skullcap', 'garrison cap'],
    },
  },
  {
    id: 'professions',
    sectionId: 'tact',
    name: 'Professions',
    words: {
      simple: ['doctor', 'teacher', 'cook', 'driver'],
      medium: ['salesperson', 'firefighter', 'builder', 'hairdresser'],
      complex: ['architect', 'programmer', 'veterinarian', 'mechanic'],
    },
  },
  {
    id: 'musical-instruments',
    sectionId: 'tact',
    name: 'Musical Instruments',
    words: {
      simple: ['drum', 'guitar', 'piano', 'pipe'],
      medium: ['flute', 'trumpet', 'saxophone', 'accordion'],
      complex: ['cello', 'trombone', 'clarinet', 'double bass'],
    },
  },
  {
    id: 'insects',
    sectionId: 'tact',
    name: 'Insects',
    words: {
      simple: ['ant', 'bee', 'butterfly', 'beetle'],
      medium: ['wasp', 'dragonfly', 'grasshopper', 'caterpillar'],
      complex: ['mantis', 'tick', 'scorpion', 'cockroach'],
    },
  },
  {
    id: 'sea-creatures',
    sectionId: 'tact',
    name: 'Sea Creatures',
    words: {
      simple: ['fish', 'whale', 'dolphin', 'crab'],
      medium: ['shark', 'jellyfish', 'starfish', 'octopus'],
      complex: ['moray eel', 'nautilus', 'squid', 'anemone'],
    },
  },
  {
    id: 'dinosaurs',
    sectionId: 'tact',
    name: 'Dinosaurs',
    words: {
      simple: ['dinosaur', 'tyrannosaurus', 'diplodocus'],
      medium: ['triceratops', 'stegosaurus', 'velociraptor'],
      complex: ['pachycephalosaurus', 'dilophosaurus', 'ankylosaurus'],
    },
  },
]

const VOCABULARY_RU: VocabularyCategory[] = [
  {
    id: 'toys',
    sectionId: 'tact',
    name: 'Игрушки',
    words: {
      simple: [
        'мяч',
        'кукла',
        'кубик',
        'машинка',
        'мишка',
        'юла',
        'шарик',
        'мячик',
        'зверушка',
        'кукла-пупс',
      ],
      medium: [
        'пирамида',
        'конструктор',
        'поезд',
        'робот',
        'пазл',
        'лошадка',
        'гараж',
        'трек',
        'барабан',
        'ксилофон',
      ],
      complex: [
        'трансформер',
        'лабиринт',
        'радиоуправляемая машина',
        'набор инструментов',
        'интерактивная игрушка',
        'фигурка супергероя',
        'настольная игра',
      ],
    },
  },
  {
    id: 'shapes',
    sectionId: 'tact',
    name: 'Формы',
    words: {
      simple: ['круг', 'квадрат', 'треугольник', 'шар', 'куб', 'линия', 'точка'],
      medium: ['овал', 'прямоугольник', 'звезда', 'сердце', 'ромб', 'крест', 'полукруг'],
      complex: [
        'трапеция',
        'цилиндр',
        'конус',
        'призма',
        'многоугольник',
        'параллелограмм',
        'сектор',
      ],
    },
  },
  {
    id: 'fruits',
    sectionId: 'tact',
    name: 'Фрукты',
    words: {
      simple: ['яблоко', 'банан', 'груша', 'слива', 'виноград', 'апельсин', 'мандарин', 'персик'],
      medium: ['абрикос', 'лимон', 'киви', 'ананас', 'нектарин', 'лайм', 'помело'],
      complex: ['гранат', 'манго', 'папайя', 'хурма', 'инжир', 'авокадо', 'маракуйя'],
    },
  },
  {
    id: 'body-parts',
    sectionId: 'tact',
    name: 'Части тела',
    words: {
      simple: ['голова', 'рука', 'нога', 'глаз', 'нос', 'рот', 'ухо', 'зуб'],
      medium: ['палец', 'плечо', 'локоть', 'колено', 'живот', 'спина', 'шея'],
      complex: ['запястье', 'щиколотка', 'подбородок', 'лодыжка', 'пятка', 'грудь', 'поясница'],
    },
  },
  {
    id: 'domestic-animals',
    sectionId: 'tact',
    name: 'Домашние животные',
    words: {
      simple: ['кошка', 'собака', 'корова', 'коза', 'лошадь', 'овца', 'курица'],
      medium: ['кролик', 'хомяк', 'поросёнок', 'телёнок', 'котёнок', 'щенок', 'утка'],
      complex: ['осёл', 'нутрия', 'морская свинка', 'шиншилла', 'пони', 'индюк'],
    },
  },
  {
    id: 'vegetables',
    sectionId: 'tact',
    name: 'Овощи',
    words: {
      simple: ['картошка', 'морковь', 'огурец', 'помидор', 'капуста', 'лук', 'чеснок'],
      medium: ['свёкла', 'кабачок', 'редис', 'перец', 'тыква', 'горох', 'кукуруза'],
      complex: ['баклажан', 'брокколи', 'цветная капуста', 'сельдерей', 'спаржа', 'артишок'],
    },
  },
  {
    id: 'forest-animals',
    sectionId: 'tact',
    name: 'Лесные животные',
    words: {
      simple: ['заяц', 'лиса', 'волк', 'медведь', 'белка', 'ёж'],
      medium: ['лось', 'кабан', 'бобр', 'барсук', 'куница', 'выдра'],
      complex: ['росомаха', 'рысь', 'бурундук', 'норка', 'горностай', 'тушканчик'],
    },
  },
  {
    id: 'clothing',
    sectionId: 'tact',
    name: 'Одежда',
    words: {
      simple: ['майка', 'рубашка', 'платье', 'юбка', 'кофта', 'шапка', 'футболка'],
      medium: ['брюки', 'куртка', 'носки', 'свитер', 'шарф', 'варежки', 'джинсы'],
      complex: ['жилет', 'комбинезон', 'плащ', 'кардиган', 'пижама', 'халат'],
    },
  },
  {
    id: 'footwear',
    sectionId: 'tact',
    name: 'Обувь',
    words: {
      simple: ['туфли', 'ботинки', 'сапоги', 'кроссовки', 'тапки', 'сандалии'],
      medium: ['кеды', 'валенки', 'босоножки', 'мокасины', 'сланцы', 'шлёпанцы'],
      complex: ['ботильоны', 'бутсы', 'лоферы', 'угги', 'чешки'],
    },
  },
  {
    id: 'furniture',
    sectionId: 'tact',
    name: 'Мебель',
    words: {
      simple: ['стол', 'стул', 'кровать', 'шкаф', 'диван', 'полка', 'кресло'],
      medium: ['тумба', 'комод', 'табурет', 'скамья', 'зеркало', 'шкафчик'],
      complex: ['буфет', 'сервант', 'стеллаж', 'этажерка', 'трюмо'],
    },
  },
  {
    id: 'dishes',
    sectionId: 'tact',
    name: 'Посуда',
    words: {
      simple: ['чашка', 'тарелка', 'ложка', 'вилка', 'кружка', 'миска'],
      medium: ['нож', 'стакан', 'кастрюля', 'сковорода', 'чайник', 'блюдце'],
      complex: ['дуршлаг', 'половник', 'фужер', 'ковш', 'салатник'],
    },
  },
  {
    id: 'food',
    sectionId: 'tact',
    name: 'Еда',
    words: {
      simple: ['хлеб', 'суп', 'каша', 'сыр', 'яйцо', 'сок', 'вода'],
      medium: ['молоко', 'йогурт', 'печенье', 'конфета', 'макароны', 'котлета'],
      complex: ['омлет', 'запеканка', 'пирожное', 'бутерброд', 'варенье'],
    },
  },
  {
    id: 'transport',
    sectionId: 'tact',
    name: 'Транспорт',
    words: {
      simple: ['машина', 'автобус', 'поезд', 'самолёт', 'велосипед', 'лодка'],
      medium: ['трамвай', 'грузовик', 'мотоцикл', 'метро', 'такси', 'корабль'],
      complex: ['вертолёт', 'бульдозер', 'экскаватор', 'троллейбус', 'трактор'],
    },
  },
  {
    id: 'school-supplies',
    sectionId: 'tact',
    name: 'Школьные принадлежности',
    words: {
      simple: ['ручка', 'карандаш', 'книга', 'тетрадь', 'рюкзак', 'альбом'],
      medium: ['линейка', 'пенал', 'фломастер', 'клей', 'кисть', 'краски'],
      complex: ['циркуль', 'точилка', 'обложка', 'закладка', 'ножницы'],
    },
  },
  {
    id: 'appliances',
    sectionId: 'tact',
    name: 'Электроприборы',
    words: {
      simple: ['телефон', 'телевизор', 'лампа', 'утюг', 'фен'],
      medium: ['компьютер', 'чайник', 'микроволновка', 'вентилятор', 'ноутбук'],
      complex: ['блендер', 'принтер', 'кондиционер', 'посудомойка', 'обогреватель'],
    },
  },
  {
    id: 'sports-equipment',
    sectionId: 'tact',
    name: 'Спортивный инвентарь',
    words: {
      simple: ['мяч', 'скакалка', 'обруч', 'кегли'],
      medium: ['коньки', 'гантели', 'клюшка', 'ракетка', 'сетка'],
      complex: ['тренажёр', 'эспандер', 'шлем', 'барьер'],
    },
  },
  {
    id: 'berries',
    sectionId: 'tact',
    name: 'Ягоды',
    words: {
      simple: ['малина', 'клубника', 'черника', 'вишня'],
      medium: ['ежевика', 'клюква', 'голубика', 'брусника'],
      complex: ['морошка', 'шелковица', 'облепиха', 'рябина'],
    },
  },
  {
    id: 'domestic-birds',
    sectionId: 'tact',
    name: 'Домашние птицы',
    words: {
      simple: ['курица', 'утка', 'гусь', 'петух'],
      medium: ['индюк', 'цыплёнок', 'утёнок', 'гусёнок'],
      complex: ['цесарка', 'селезень', 'фазан', 'павлин'],
    },
  },
  {
    id: 'wild-birds',
    sectionId: 'tact',
    name: 'Дикие птицы',
    words: {
      simple: ['воробей', 'голубь', 'ворона', 'сорока'],
      medium: ['дятел', 'чайка', 'лебедь', 'снегирь'],
      complex: ['орёл', 'ястреб', 'журавль', 'аист'],
    },
  },
  {
    id: 'fish',
    sectionId: 'tact',
    name: 'Рыбы',
    words: {
      simple: ['рыба', 'окунь', 'щука', 'карась'],
      medium: ['карп', 'форель', 'судак', 'сельдь'],
      complex: ['акула', 'скат', 'угорь', 'камбала'],
    },
  },
  {
    id: 'trees-flowers',
    sectionId: 'tact',
    name: 'Деревья и цветы',
    words: {
      simple: ['дерево', 'берёза', 'ёлка', 'дуб', 'роза'],
      medium: ['клён', 'липа', 'ромашка', 'лилия', 'василёк'],
      complex: ['орхидея', 'акация', 'хризантема', 'сирень'],
    },
  },
  {
    id: 'headwear',
    sectionId: 'tact',
    name: 'Головные уборы',
    words: {
      simple: ['шапка', 'кепка', 'шляпа', 'панама'],
      medium: ['берет', 'бандана', 'косынка', 'ушанка'],
      complex: ['цилиндр', 'фуражка', 'тюбетейка', 'пилотка'],
    },
  },
  {
    id: 'professions',
    sectionId: 'tact',
    name: 'Профессии',
    words: {
      simple: ['врач', 'учитель', 'повар', 'водитель'],
      medium: ['продавец', 'пожарный', 'строитель', 'парикмахер'],
      complex: ['архитектор', 'программист', 'ветеринар', 'механик'],
    },
  },
  {
    id: 'musical-instruments',
    sectionId: 'tact',
    name: 'Музыкальные инструменты',
    words: {
      simple: ['барабан', 'гитара', 'пианино', 'дудка'],
      medium: ['флейта', 'труба', 'саксофон', 'баян'],
      complex: ['виолончель', 'тромбон', 'кларнет', 'контрабас'],
    },
  },
  {
    id: 'insects',
    sectionId: 'tact',
    name: 'Насекомые',
    words: {
      simple: ['муравей', 'пчела', 'бабочка', 'жук'],
      medium: ['оса', 'стрекоза', 'кузнечик', 'гусеница'],
      complex: ['богомол', 'клещ', 'скорпион', 'таракан'],
    },
  },
  {
    id: 'sea-creatures',
    sectionId: 'tact',
    name: 'Морские обитатели',
    words: {
      simple: ['рыба', 'кит', 'дельфин', 'краб'],
      medium: ['акула', 'медуза', 'морская звезда', 'осьминог'],
      complex: ['мурена', 'наутилус', 'кальмар', 'анемона'],
    },
  },
  {
    id: 'dinosaurs',
    sectionId: 'tact',
    name: 'Динозавры',
    words: {
      simple: ['динозавр', 'тираннозавр', 'диплодок'],
      medium: ['трицератопс', 'стегозавр', 'велоцираптор'],
      complex: ['пахицефалозавр', 'дилофозавр', 'анкилозавр'],
    },
  },
]

export const VOCABULARY_BY_LANGUAGE: Record<Language, VocabularyCategory[]> = {
  en: VOCABULARY_EN,
  ru: VOCABULARY_RU,
}
