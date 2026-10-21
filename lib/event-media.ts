export type EventAlbum = { slug: string; title: string; subtitle: string; description: string; cover: string; photos: string[]; videos: {src: string; poster: string; duration: string}[] };
function media(slug: string, count: number, durations: string[]) {
  return {photos: Array.from({length:count},(_,i)=>`/images/events/${slug}/photo-${i+1}.webp`),
    videos: durations.map((duration,i)=>({src:`/videos/events/${slug}/video-${i+1}.mp4`,poster:`/images/events/${slug}/video-${i+1}-poster.webp`,duration}))};
}
export const eventAlbums: EventAlbum[] = [
  {slug:'rasshirenie-vozmozhnostey',title:'Расширение возможностей',subtitle:'29 сентября · бизнес-расстановка · Владивосток',description:'Моменты встречи о масштабе, внутренних ограничениях и следующем шаге в развитии бизнеса. Фотографии и видео из пространства центра «Путь к себе».',cover:'/images/events/rasshirenie-vozmozhnostey/photo-9.webp',...media('rasshirenie-vozmozhnostey',9,['0:20','0:09','0:20'])},
  {slug:'rassvet-biznesa',title:'Яхта · Деньги. Смыслы. Отношения',subtitle:'15 сентября · тренинг на яхте · Владивосток',description:'День на воде, вдали от повседневной суеты: встречи, практики и разговоры о деньгах, отношениях и личных смыслах. Фото и видео прошедшего тренинга.',cover:'/images/events/rassvet-biznesa/photo-1.webp',...media('rassvet-biznesa',3,['0:19','0:06','1:00','0:06','0:41','0:10','0:05','0:23','0:12'])},
];
