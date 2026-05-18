# Champions Online Hero Builder

A lightweight build planner for Champions Online. Built on the solid foundations of earlier community planners.

This tool allows players to map out powers, advantages, devices, PVD's, specializations and stats, making build sharing cleaner and easier than ever.

-- Updated by BlackWyvern
* **Added Talents:** Should correctly import talents from all external sources. Added talent exporting to current export model, that does not interfere with VTWind's current implimentation.

## Features

* **Static Hosting Ready:** Designed to run entirely in the browser using HTML, CSS, and vanilla JavaScript. Currently hosted via GitHub Pages.
* **Legacy Compatibility:** Translates Aesica HeroCreator build links and loads them into the app.
* **Extensible Architecture:** Built to easily accommodate custom powers, devices, and variants.

## Installation & Usage
https://blackwyvern.github.io/HeroBuilder/
You can use the live version hosted on GitHub Pages right now, or run it locally yourself. Since this is a purely frontend application, there are no complex dependencies to install or servers to configure.

1. Clone or download this repository to your local machine.
2. Open `index.html` in any modern web browser.
3. Start building! 

To host your own fork live, simply drop the files onto any static web host (like GitHub Pages, Netlify, or Vercel).

## Adding Custom Content

To add new powers, devices, or perks to the tool, open `custom-additions.js` and add your new object to the bottom of the relevant array.

> **⚠️ CRITICAL WARNING FOR MODDERS:** > Always add new items to the **very bottom** of your arrays. Because this tool uses index-based Base36 compression to keep URLs short, the export links rely on a power's specific "seat" in the array. Inserting an item into the middle of a list—or deleting an item entirely—will shift everything below it, permanently corrupting any previously generated build links. If you need to remove a power, replace its data with an empty, invisible placeholder object to hold its index seat. 

Additionally, avoid modifying the original hc-data file to retain compatability with aesica build links.

## License

This project is licensed under the [GNU General Public License v3.0](https://choosealicense.com/licenses/gpl-3.0/).

You are absolutely free to use, modify, and distribute this software. However, any derivative works or modified versions you release **must** also be open-source and provided for free under this exact same license.




==============================  CREDITS  ==================================

A large majority of the informaion in this planner relies on Aesica's database files
and this project would not be possible without her foundation.

find her herocreator at   https://aesica.net/co/beta/herocreator.htm

Updated spec information AND the ability to import balaknightfang build links comes from Behemoth King's Powerhouse project

you can find it here    https://woof-wolf.github.io/powerhouse/index.html

VTWind's base version of this new hero builder

https://vtwind.github.io/HeroBuilder/

======================  CONTRIBUTORS & TESTERS ======================

Me.

============ DISCLAIMER =============

This software was coded with the help of Google Gemini Pro AI. And edited with more Gemini Pro.
AI is not perfect, this project was simply made for fun over the span of a few days.
Please report all bugs, typos, old information, missing information and any other relevant issues to me via discord or github.







