
import * as mm from 'music-metadata-browser';

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  coverUrl?: string;
}

export const extractMetadata = async (file: File): Promise<AudioMetadata> => {
  try {
    const metadata = await mm.parseBlob(file);
    const { common } = metadata;
    let coverUrl: string | undefined;

    if (common.picture && common.picture.length > 0) {
      const picture = common.picture[0];
      const blob = new Blob([picture.data], { type: picture.format });
      coverUrl = URL.createObjectURL(blob);
    }

    return {
      title: common.title,
      artist: common.artist,
      album: common.album,
      coverUrl,
    };
  } catch (error) {
    console.error('Error reading tags:', error);
    return {};
  }
};
