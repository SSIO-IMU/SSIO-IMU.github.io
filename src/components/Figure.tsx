import clsx from "clsx";
import React, { useEffect, useState } from "react";

import ExpandableImage from "@/components/ExpandableImage";
import ExternalSwitch from "@/components/Switch";

type FigureProp = { img_src: string; alt: string; title: string; caption: React.ReactNode; isDark: boolean; idx: number; }

const Figure = ({ img_src, alt, title, caption, isDark, idx }: FigureProp) => {
  const caption_clr = isDark ? 'text-gray-400' : 'text-gray-600';

  const [invert_prop, set_invert_prop] = useState<'invert' | 'invert-0'>(isDark ? 'invert' : 'invert-0');
  useEffect(() => {
    set_invert_prop(isDark ? 'invert' : 'invert-0');
  }, [isDark]);

  return (
    <figure className='flex flex-col items-center justify-center'>
      <ExpandableImage
        src={img_src}
        alt={alt}
        title={title}
        imageClassName={clsx(invert_prop, invert_prop === 'invert' && 'bg-gray-200')}
      />
      {
        isDark ?
          <div className={clsx(caption_clr, "text-sm", invert_prop === 'invert' ? 'text-primary-500' : '')}>
            <span>Color Inversion {invert_prop === 'invert' ? "ON" : "OFF"} </span>
            <ExternalSwitch state={invert_prop === 'invert'} switch_state={() => set_invert_prop(invert_prop === 'invert' ? 'invert-0' : 'invert')} size="small" />
          </div> : null
      }
      <figcaption className={clsx('figure-caption', isDark && 'text-gray-300 [&_strong]:text-gray-100')}>
        <strong>Figure {idx}. {title}.</strong>{' '}{caption}
      </figcaption>
    </figure>
  );
}

export default Figure;

