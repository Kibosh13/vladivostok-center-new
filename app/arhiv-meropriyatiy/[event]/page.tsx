import {notFound} from 'next/navigation';
import {SiteHeader,SiteFooter} from '@/components/site-shell';
import {EventAlbumContent} from '@/components/event-album';
import {eventAlbums} from '@/lib/event-media';
import {defaultPageSeo} from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{event:string}>}) {
  const {event}=await params,album=eventAlbums.find(a=>a.slug===event);
  return album?defaultPageSeo(`arhiv-meropriyatiy/${event}`,`${album.title}: фото и видео`,album.description):{};
}
export default async function AlbumPage({params}:{params:Promise<{event:string}>}) {
  const {event}=await params,album=eventAlbums.find(a=>a.slug===event);if(!album)notFound();
  return <main><SiteHeader/><EventAlbumContent album={album}/><SiteFooter/></main>;
}
