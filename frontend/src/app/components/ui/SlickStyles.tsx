import React from 'react';

export const SlickStyles = () => (
  <style>{`
    .slick-slider{position:relative;display:block;box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-touch-callout:none;-khtml-user-select:none;-ms-touch-action:pan-y;touch-action:pan-y;-webkit-tap-highlight-color:transparent}
    .slick-list{position:relative;display:block;overflow:hidden;margin:0;padding:0}
    .slick-list:focus{outline:none}
    .slick-list.dragging{cursor:pointer;cursor:hand}
    .slick-slider .slick-track,.slick-slider .slick-list{-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);-ms-transform:translate3d(0,0,0);-o-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}
    .slick-track{position:relative;top:0;left:0;display:block;margin-left:auto;margin-right:auto}
    .slick-track:before,.slick-track:after{display:table;content:''}
    .slick-track:after{clear:both}
    .slick-loading .slick-track{visibility:hidden}
    .slick-slide{display:none;float:left;height:100%;min-height:1px}
    [dir='rtl'] .slick-slide{float:right}
    .slick-slide img{display:block}
    .slick-slide.slick-loading img{display:none}
    .slick-slide.dragging img{pointer-events:none}
    .slick-initialized .slick-slide{display:block}
    .slick-loading .slick-slide{visibility:hidden}
    .slick-vertical .slick-slide{display:block;height:auto;border:1px solid transparent}
    .slick-arrow.slick-hidden{display:none}
    
    /* Custom Dots Styling */
    .slick-dots { 
      display: flex !important; 
      justify-content: center; 
      gap: 8px; 
      margin-top: 10px; 
      position: absolute; 
      bottom: -25px; 
      width: 100%; 
      list-style: none; 
      padding: 0; 
    }
    .slick-dots li { 
      width: 8px; 
      height: 8px; 
    }
    .slick-dots li button { 
      font-size: 0; 
      width: 8px; 
      height: 8px; 
      border-radius: 50%; 
      background: #e5e7eb; 
      border: none; 
      padding: 0; 
      cursor: pointer; 
      transition: all 0.3s; 
    }
    .slick-dots li.slick-active button { 
      background: #7151ff; 
      width: 24px; 
      border-radius: 4px; 
    }
  `}</style>
);
