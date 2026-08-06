/**
 * Gospels Live — chamber climates + full command archive (KJV).
 * Archive titles/references follow a traditional 48-command Gospel list;
 * chamber entries are Human Weather somatic framings of living commands.
 */

export const CHAMBER_COMMANDS = [
  {
    id: 'fear-not',
    climate: 'Bracing',
    climateHint: 'Threat without arrival',
    latin: 'Nolite timere',
    command: 'Be not afraid',
    source: 'Luke 2:10 · Matthew 10:28',
    weather: 'When the body braces for threat that has not arrived.',
    practice:
      'Place one hand on the sternum. Lengthen the exhale until it outlasts the inhale. Say the command once out loud, once under the breath.',
    breath: { inhale: 4, hold: 2, exhale: 6 },
    hue: 'rgba(196,168,74,0.22)',
    archiveNumbers: [23],
  },
  {
    id: 'peace-still',
    climate: 'Storm',
    climateHint: 'Interior louder than the room',
    latin: 'Quiesce',
    command: 'Peace, be still',
    source: 'Mark 4:39',
    weather: 'When the interior storm is louder than the room you are in.',
    practice:
      'Sit until the jaw softens. Trace one slow circle with the gaze. Speak the command into the weather you are actually in — not the one you fear.',
    breath: { inhale: 4, hold: 4, exhale: 8 },
    hue: 'rgba(100,140,160,0.20)',
    archiveNumbers: [],
  },
  {
    id: 'take-heart',
    climate: 'Thin',
    climateHint: 'Courage as costume',
    latin: 'Confidite',
    command: 'Take heart',
    source: 'John 16:33 · Matthew 14:27',
    weather: 'When courage feels like a costume you cannot keep wearing.',
    practice:
      'Stand. Feel the weight in both heels. Inhale through the nose for four, hold for two, release for six. Receive the command as permission, not performance.',
    breath: { inhale: 4, hold: 2, exhale: 6 },
    hue: 'rgba(196,100,60,0.18)',
    archiveNumbers: [],
  },
  {
    id: 'come-unto-me',
    climate: 'Heavy',
    climateHint: 'Load carried alone',
    latin: 'Venite ad me',
    command: 'Come unto me',
    source: 'Matthew 11:28-29',
    weather: 'When the load has been carried alone for too long.',
    practice:
      'Name one weight you are holding that is not yours to finish today. Set the shoulders down on the exhale. Let the command be an invitation, not a demand.',
    breath: { inhale: 3, hold: 1, exhale: 7 },
    hue: 'rgba(120,90,70,0.22)',
    archiveNumbers: [25],
  },
  {
    id: 'abide',
    climate: 'Scattered',
    climateHint: 'Mind leaving the body',
    latin: 'Manete',
    command: 'Abide in me',
    source: 'John 15:4',
    weather: 'When the mind keeps leaving the body for tomorrow.',
    practice:
      'Return to one sensory fact: temperature, light, contact with the chair. Stay for ninety seconds. Abiding is the opposite of forecasting.',
    breath: { inhale: 4, hold: 4, exhale: 4 },
    hue: 'rgba(90,140,110,0.18)',
    archiveNumbers: [],
  },
  {
    id: 'love-one-another',
    climate: 'Distant',
    climateHint: 'Nearness has gone quiet',
    latin: 'Diligite',
    command: 'Love one another',
    source: 'John 13:34 · Matthew 22:39',
    weather: 'When distance has become the default between you and another.',
    practice:
      'Choose one concrete nearness: a message, a meal, a minute of undivided attention. Love as regulation practiced between nervous systems.',
    breath: { inhale: 5, hold: 0, exhale: 5 },
    hue: 'rgba(160,90,100,0.16)',
    archiveNumbers: [40],
  },
  {
    id: 'watch-and-pray',
    climate: 'Restless',
    climateHint: 'Spirit willing, flesh thin',
    latin: 'Vigilate',
    command: 'Watch and pray',
    source: 'Matthew 26:41',
    weather: 'When the night feels longer than your capacity to stay awake inside it.',
    practice:
      'Sit upright. Soften the eyes. Match the breath to a slow count. Watch without scanning for threat — pray without performing certainty.',
    breath: { inhale: 4, hold: 3, exhale: 6 },
    hue: 'rgba(140,120,80,0.20)',
    archiveNumbers: [43],
  },
  {
    id: 'ask-seek-knock',
    climate: 'Searching',
    climateHint: 'Door not yet opened',
    latin: 'Petite',
    command: 'Ask, seek, knock',
    source: 'Matthew 7:7-8',
    weather: 'When you keep circling the same closed door and calling it patience.',
    practice:
      'Name one true ask in a single sentence. Breathe once. Seek the next honest step only — not the whole answer. Knock by acting once, then wait.',
    breath: { inhale: 4, hold: 2, exhale: 4 },
    hue: 'rgba(170,130,70,0.18)',
    archiveNumbers: [17],
  },
  {
    id: 'love-enemies',
    climate: 'Opposed',
    climateHint: 'Heat toward another',
    latin: 'Diligite inimicos',
    command: 'Love your enemies',
    source: 'Matthew 5:44',
    weather: 'When heat toward another person is running the whole interior climate.',
    practice:
      'Do not force warmth. Soften the jaw. Bless once under the breath — not as surrender of truth, as refusal to let contempt own the nervous system.',
    breath: { inhale: 5, hold: 2, exhale: 7 },
    hue: 'rgba(150,70,60,0.18)',
    archiveNumbers: [10],
  },
];

/** Full 48-command archive (KJV text). */
export const GOSPEL_ARCHIVE = [
  {
    n: 1,
    title: 'Repent',
    ref: 'Matthew 4:17',
    verse:
      'From that time Jesus began to preach, and to say, Repent: for the kingdom of heaven is at hand.',
  },
  {
    n: 2,
    title: 'Follow Me',
    ref: 'Matthew 4:19',
    verse: 'And he saith unto them, Follow me, and I will make you fishers of men.',
  },
  {
    n: 3,
    title: 'Rejoice',
    ref: 'Matthew 5:12',
    verse:
      'Rejoice, and be exceeding glad: for great is your reward in heaven: for so persecuted they the prophets which were before you.',
  },
  {
    n: 4,
    title: 'Let Your Light Shine',
    ref: 'Matthew 5:16',
    verse:
      'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.',
  },
  {
    n: 5,
    title: "Honor God's Law",
    ref: 'Matthew 5:17-19',
    verse:
      'Think not that I am come to destroy the law, or the prophets: I am not come to destroy, but to fulfil.',
  },
  {
    n: 6,
    title: 'Be Reconciled',
    ref: 'Matthew 5:24-25',
    verse:
      'Leave there thy gift before the altar, and go thy way; first be reconciled to thy brother, and then come and offer thy gift.',
  },
  {
    n: 7,
    title: 'Do Not Lust',
    ref: 'Matthew 5:28-30',
    verse:
      'But I say unto you, That whosoever looketh on a woman to lust after her hath committed adultery with her already in his heart.',
  },
  {
    n: 8,
    title: 'Keep Your Word',
    ref: 'Matthew 5:37',
    verse:
      'But let your communication be, Yea, yea; Nay, nay: for whatsoever is more than these cometh of evil.',
  },
  {
    n: 9,
    title: 'Go the Second Mile',
    ref: 'Matthew 5:38-42',
    verse:
      'And whosoever shall compel thee to go a mile, go with him twain. Give to him that asketh thee, and from him that would borrow of thee turn not thou away.',
  },
  {
    n: 10,
    title: 'Love Your Enemies',
    ref: 'Matthew 5:44',
    verse:
      'But I say unto you, Love your enemies, bless them that curse you, do good to them that hate you, and pray for them which despitefully use you, and persecute you;',
  },
  {
    n: 11,
    title: 'Be Perfect',
    ref: 'Matthew 5:48',
    verse: 'Be ye therefore perfect, even as your Father which is in heaven is perfect.',
  },
  {
    n: 12,
    title: 'Practice Secret Disciplines',
    ref: 'Matthew 6:1-18',
    verse:
      'But thou, when thou prayest, enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret; and thy Father which seeth in secret shall reward thee openly.',
  },
  {
    n: 13,
    title: 'Lay Up Treasures in Heaven',
    ref: 'Matthew 6:19-21',
    verse:
      'But lay up for yourselves treasures in heaven, where neither moth nor rust doth corrupt, and where thieves do not break through nor steal: For where your treasure is, there will your heart be also.',
  },
  {
    n: 14,
    title: "Seek God's Kingdom",
    ref: 'Matthew 6:33',
    verse:
      'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.',
  },
  {
    n: 15,
    title: 'Judge Not',
    ref: 'Matthew 7:1-2',
    verse:
      'Judge not, that ye be not judged. For with what judgment ye judge, ye shall be judged: and with what measure ye mete, it shall be measured to you again.',
  },
  {
    n: 16,
    title: 'Do Not Throw Pearls to Pigs',
    ref: 'Matthew 7:6',
    verse:
      'Give not that which is holy unto the dogs, neither cast ye your pearls before swine, lest they trample them under their feet, and turn again and rend you.',
  },
  {
    n: 17,
    title: 'Ask, Seek, Knock',
    ref: 'Matthew 7:7-8',
    verse:
      'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you: For every one that asketh receiveth; and he that seeketh findeth; and to him that knocketh it shall be opened.',
  },
  {
    n: 18,
    title: 'Do Unto Others',
    ref: 'Matthew 7:12',
    verse:
      'Therefore all things whatsoever ye would that men should do to you, do ye even so to them: for this is the law and the prophets.',
  },
  {
    n: 19,
    title: 'Choose the Narrow Way',
    ref: 'Matthew 7:13-14',
    verse:
      'Enter ye in at the strait gate: for wide is the gate, and broad is the way, that leadeth to destruction, and many there be which go in thereat: Because strait is the gate, and narrow is the way, which leadeth unto life, and few there be that find it.',
  },
  {
    n: 20,
    title: 'Beware of False Prophets',
    ref: 'Matthew 7:15',
    verse:
      "Beware of false prophets, which come to you in sheep's clothing, but inwardly they are ravening wolves.",
  },
  {
    n: 21,
    title: 'Pray for Laborers',
    ref: 'Matthew 9:38',
    verse:
      'Pray ye therefore the Lord of the harvest, that he will send forth labourers into his harvest.',
  },
  {
    n: 22,
    title: 'Be Wise as Serpents',
    ref: 'Matthew 10:16',
    verse:
      'Behold, I send you forth as sheep in the midst of wolves: be ye therefore wise as serpents, and harmless as doves.',
  },
  {
    n: 23,
    title: 'Fear Not',
    ref: 'Matthew 10:28',
    verse:
      'And fear not them which kill the body, but are not able to kill the soul: but rather fear him which is able to destroy both soul and body in hell.',
  },
  {
    n: 24,
    title: "Hear God's Voice",
    ref: 'Matthew 11:15',
    verse: 'He that hath ears to hear, let him hear.',
  },
  {
    n: 25,
    title: 'Take My Yoke',
    ref: 'Matthew 11:29',
    verse:
      'Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.',
  },
  {
    n: 26,
    title: 'Honor Your Parents',
    ref: 'Matthew 15:4',
    verse:
      'For God commanded, saying, Honour thy father and mother: and, He that curseth father or mother, let him die the death.',
  },
  {
    n: 27,
    title: 'Beware of Leaven',
    ref: 'Matthew 16:6',
    verse:
      'Then Jesus said unto them, Take heed and beware of the leaven of the Pharisees and of the Sadducees.',
  },
  {
    n: 28,
    title: 'Deny Yourself',
    ref: 'Matthew 16:24',
    verse:
      'Then said Jesus unto his disciples, If any man will come after me, let him deny himself, and take up his cross, and follow me.',
  },
  {
    n: 29,
    title: 'Do Not Despise Little Ones',
    ref: 'Matthew 18:10',
    verse:
      'Take heed that ye despise not one of these little ones; for I say unto you, That in heaven their angels do always behold the face of my Father which is in heaven.',
  },
  {
    n: 30,
    title: 'Go to Offenders',
    ref: 'Matthew 18:15',
    verse:
      'Moreover if thy brother shall trespass against thee, go and tell him his fault between thee and him alone: if he shall hear thee, thou hast gained thy brother.',
  },
  {
    n: 31,
    title: 'Beware of Covetousness',
    ref: 'Luke 12:15',
    verse:
      "And he said unto them, Take heed, and beware of covetousness: for a man's life consisteth not in the abundance of the things which he possesseth.",
  },
  {
    n: 32,
    title: 'Forgive Offenders',
    ref: 'Matthew 18:21-22',
    verse:
      'Jesus saith unto him, I say not unto thee, Until seven times: but, Until seventy times seven.',
  },
  {
    n: 33,
    title: 'Honor Marriage',
    ref: 'Matthew 19:6',
    verse:
      'Wherefore they are no more twain, but one flesh. What therefore God hath joined together, let not man put asunder.',
  },
  {
    n: 34,
    title: 'Be a Servant',
    ref: 'Matthew 20:26-27',
    verse:
      'But it shall not be so among you: but whosoever will be great among you, let him be your minister; And whosoever will be chief among you, let him be your servant:',
  },
  {
    n: 35,
    title: 'Be a House of Prayer',
    ref: 'Matthew 21:13',
    verse:
      'And said unto them, It is written, My house shall be called the house of prayer; but ye have made it a den of thieves.',
  },
  {
    n: 36,
    title: 'Ask in Faith',
    ref: 'Matthew 21:21-22',
    verse:
      'And all things, whatsoever ye shall ask in prayer, believing, ye shall receive.',
  },
  {
    n: 37,
    title: 'Bring in the Poor',
    ref: 'Luke 14:12-14',
    verse:
      'But when thou makest a feast, call the poor, the maimed, the lame, the blind: And thou shalt be blessed; for they cannot recompense thee: for thou shalt be recompensed at the resurrection of the just.',
  },
  {
    n: 38,
    title: 'Render to Caesar',
    ref: 'Matthew 22:19-21',
    verse:
      "Render therefore unto Caesar the things which are Caesar's; and unto God the things that are God's.",
  },
  {
    n: 39,
    title: 'Love the Lord',
    ref: 'Matthew 22:37',
    verse:
      'Jesus said unto him, Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind.',
  },
  {
    n: 40,
    title: 'Love Your Neighbor',
    ref: 'Matthew 22:39',
    verse: 'And the second is like unto it, Thou shalt love thy neighbour as thyself.',
  },
  {
    n: 41,
    title: 'Await My Return',
    ref: 'Matthew 24:42-44',
    verse:
      'Watch therefore: for ye know not what hour your Lord doth come. Therefore be ye also ready: for in such an hour as ye think not the Son of man cometh.',
  },
  {
    n: 42,
    title: "Celebrate the Lord's Supper",
    ref: 'Matthew 26:26-27',
    verse:
      'And as they were eating, Jesus took bread, and blessed it, and brake it, and gave it to the disciples, and said, Take, eat; this is my body.',
  },
  {
    n: 43,
    title: 'Watch and Pray',
    ref: 'Matthew 26:41',
    verse:
      'Watch and pray, that ye enter not into temptation: the spirit indeed is willing, but the flesh is weak.',
  },
  {
    n: 44,
    title: 'Feed My Sheep',
    ref: 'John 21:15-16',
    verse: 'He saith unto him, Feed my lambs… He saith unto him, Feed my sheep.',
  },
  {
    n: 45,
    title: 'Baptize My Disciples',
    ref: 'Matthew 28:19',
    verse:
      'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:',
  },
  {
    n: 46,
    title: 'Teach Them to Obey My Commands',
    ref: 'Matthew 28:20',
    verse:
      'Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen.',
  },
  {
    n: 47,
    title: "Receive God's Power",
    ref: 'Luke 24:49',
    verse:
      'And, behold, I send the promise of my Father upon you: but tarry ye in the city of Jerusalem, until ye be endued with power from on high.',
  },
  {
    n: 48,
    title: 'Make Disciples',
    ref: 'Matthew 28:19-20',
    verse:
      'Go ye therefore, and teach all nations… Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen.',
  },
];

export function chamberForArchiveNumber(n) {
  return CHAMBER_COMMANDS.find(c => (c.archiveNumbers || []).includes(n)) || null;
}
