// ==========================================================================
//   The one list of blog posts.
//
//   Every blog card on the site (the Blog Hub grid and every
//   "More Blog Posts" / "Blog" carousel) is built from this list by
//   script.js. To publish a new article, add an entry here. No other
//   page needs editing.
//
//   url       Page address, e.g. "/LavaLamps" for LavaLamps.html
//   image     Card image file in the site folder
//   tag       Small yellow label above the title
//   title     Card heading
//   summary   One or two sentences shown on the card
//   carousel  false = Blog Hub grid only (e.g. placeholders)
//
//   The Blog Hub grid shows posts in the order below.
//   Carousels shuffle them on every load and leave out the page you're on.
// ==========================================================================

window.HAMILTONHACKS_POSTS = [
    {
        url: "/velocihacktor",
        image: "velocihacktor.webp",
        tag: "Insider Threats",
        title: "Jurassic Park was an inside job.",
        summary: "In the classic 1994 movie Jurassic Park, deliberate power sabotage causes the physical security system to fail and chaos to follow.",
    },
    {
        url: "/IoTBlockchain",
        image: "IoT.webp",
        tag: "Blockchain + IoT",
        title: "Ethereum Blockchain for IoT Node Transaction Authentication",
        summary: "Can blockchain be used to authenticate communications between IoT devices in a simulated network? Yes, but it is complicated.",
    },
    {
        url: "/PiHole",
        image: "pihole-top.webp",
        tag: "Networking",
        title: "Shut your Pi-hole. Adkiller Writeup",
        summary: "Last year I set up a Pi-hole and since then my life has significantly improved. Bricking the internet in my home and scrambling to fix my home network at 08:59 before starting work. No pain no gain.",
    },
    {
        url: "/",
        image: "image.png",
        tag: "Infrastructure",
        title: "We're gonna need a bigger cable",
        summary: "The internet is under the ocean. This article highlights the genuine problem of undersea cables getting eaten by sharks. Genuinely. Writing coming soon.",
    },
    {
        url: "/LavaLamps",
        image: "lavalamps-waves.webp",
        tag: "Encryption",
        title: "The internet is protected by lava lamps",
        summary: "A write-up on Cloudflare's obscure yet effective lava lamp wall encryption method, highlighting strength in randomisation.",
    },
    {
        url: "/",
        image: "image.png",
        tag: "Lorem Ipsum Dolor Sit Amet",
        title: "Lorem Ipsum Dolor Sit Amet",
        summary: "Lorem Ipsum Dolor Sit Amet",
        carousel: false,
    },
    {
        url: "/",
        image: "image.png",
        tag: "Lorem Ipsum Dolor Sit Amet",
        title: "Lorem Ipsum Dolor Sit Amet",
        summary: "Lorem Ipsum Dolor Sit Amet",
        carousel: false,
    },
    {
        url: "/",
        image: "image.png",
        tag: "Lorem Ipsum Dolor Sit Amet",
        title: "Lorem Ipsum Dolor Sit Amet",
        summary: "Lorem Ipsum Dolor Sit Amet",
        carousel: false,
    },
    {
        url: "/",
        image: "image.png",
        tag: "Lorem Ipsum Dolor Sit Amet",
        title: "Lorem Ipsum Dolor Sit Amet",
        summary: "Lorem Ipsum Dolor Sit Amet",
        carousel: false,
    },
    {
        url: "/",
        image: "image.png",
        tag: "Lorem Ipsum Dolor Sit Amet",
        title: "Lorem Ipsum Dolor Sit Amet",
        summary: "Lorem Ipsum Dolor Sit Amet",
        carousel: false,
    },
];
