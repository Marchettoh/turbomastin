import type { ImageMetadata } from "astro";
import officina from "../../public/officina.jpeg";

export interface WorkPhoto {
  image: ImageMetadata;
  alt: string;
  caption: string;
  source: string;
  stage: "Prima" | "Durante" | "Risultato";
}

export const workStory: {
  title: string;
  description: string;
  photos: WorkPhoto[];
} = {
  title: "Un lavoro, da vicino",
  description: "",
  photos: [],
};

export const photos = [
  {
    image: officina,
    alt: "Interno di un’officina con un’auto rossa e banchi da lavoro.",
    caption: "Uno sguardo in officina",
    source:
      "Foto fornita dal committente: public/officina.jpeg. Provenienza e diritti da confermare prima del rilascio.",
  },
];
