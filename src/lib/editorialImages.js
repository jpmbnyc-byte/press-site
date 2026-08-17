const ARCHIVAL_ESSAY_IMAGES = {
  'no-parade-the-fallow-ground': {
    src: '/essays/no-parade-the-fallow-ground.webp',
    alt: 'Harrowing a fallow wheat field in Antelope Valley, Los Angeles County, California, 1937.',
    caption:
      'Dorothea Lange. Antelope Valley, Los Angeles County, California, May 1937. Farm Security Administration/Office of War Information Photograph Collection, Library of Congress.',
  },
  'no-parade-the-work-without-applause': {
    src: '/essays/no-parade-the-work-without-applause.webp',
    alt: 'Men working under the State Emergency Relief Administration on the outskirts of Los Angeles, 1935.',
    caption:
      'Dorothea Lange. Outskirts of Los Angeles, California, March 1935. Farm Security Administration/Office of War Information Photograph Collection, Library of Congress.',
  },
  'the-procession-the-weight-we-carry': {
    src: '/essays/the-procession-the-weight-we-carry.webp',
    alt: 'A migrant family loading a truck before departure for California near Muskogee, Oklahoma, 1939.',
    caption:
      'Russell Lee. Near Muskogee, Oklahoma, July 1939. Farm Security Administration/Office of War Information Photograph Collection, Library of Congress.',
  },
  'the-procession-temporary-kin': {
    src: '/essays/the-procession-temporary-kin.webp',
    alt: 'Migratory workers scanning the bulletin board at the Farm Security Administration camp in Calipatria, California, 1939.',
    caption:
      'Dorothea Lange. Calipatria, Imperial Valley, California, February 1939. Farm Security Administration/Office of War Information Photograph Collection, Library of Congress.',
  },
  'the-procession-what-the-hands-kept': {
    src: '/essays/the-procession-what-the-hands-kept.webp',
    alt: "Close view of a cutter's hands cutting cloth at Jersey Homesteads, Hightstown, New Jersey, 1936.",
    caption:
      'Russell Lee. Jersey Homesteads, Hightstown, New Jersey, November 1936. Farm Security Administration/Office of War Information Photograph Collection, Library of Congress.',
  },
};

const PERSONAL_IMAGE_SLUGS = new Set([
  'on-bliss-the-temperature-of-her-joy',
]);

export function getEditorialImage(article) {
  if (!article?.slug) return null;

  if (article.hero_image_url) {
    const personalAlt = PERSONAL_IMAGE_SLUGS.has(article.slug)
      ? 'The author’s grandmother, remembered in The Temperature of Her Joy.'
      : '';

    return {
      src: article.hero_image_url,
      alt: article.hero_image_alt || personalAlt,
      caption: article.hero_image_caption || '',
    };
  }

  const archival = ARCHIVAL_ESSAY_IMAGES[article.slug];
  if (archival) return archival;

  return null;
}
