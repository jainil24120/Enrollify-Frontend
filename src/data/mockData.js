export const analyticsSalesData = [
    { date: "Mar 01", views: 120, registrations: 40 },
    { date: "Mar 05", views: 300, registrations: 120 },
    { date: "Mar 09", views: 450, registrations: 180 },
    { date: "Mar 13", views: 800, registrations: 320 },
    { date: "Mar 17", views: 600, registrations: 260 },
    { date: "Mar 21", views: 1200, registrations: 500 },
    { date: "Mar 25", views: 900, registrations: 350 },
    { date: "Mar 29", views: 1500, registrations: 800 },
];

export const analyticsDeviceData = [
    { name: "Mobile", value: 85, color: "#00c6ff" },
    { name: "Desktop", value: 15, color: "#a855f7" },
];

export const analyticsWebinarData = [
    {
        id: 1,
        name: "Master React in 7 Days",
        visitors: 4500,
        registered: 850,
        dropOff: "15%",
        revenue: "₹85,000",
        topTraffic: true
    },
    {
        id: 2,
        name: "Complete UI/UX Blueprint",
        visitors: 3200,
        registered: 420,
        dropOff: "22%",
        revenue: "₹42,000",
        topTraffic: false
    },
    {
        id: 3,
        name: "SEO for Beginners",
        visitors: 1800,
        registered: 240,
        dropOff: "8%",
        revenue: "₹24,000",
        topTraffic: false
    }
];

export const audienceData = [
    {
        id: 1,
        name: "Rahul Sharma",
        email: "rahul.s@example.com",
        phone: "+91 98765 43210",
        webinarsAttended: 2,
        totalSpent: "₹2,499",
        joinedDate: "12 Jan, 2024",
        avatarColor: "#00c6ff",
        timeline: [
            { date: "12 Jan, 2024", event: "Attended Free Masterclass" },
            { date: "15 Jan, 2024", event: "Purchased Growth Plan (₹1,499)" },
            { date: "10 Feb, 2024", event: "Purchased UI/UX Crash Course (₹1,000)" }
        ]
    },
    {
        id: 2,
        name: "Priya Desai",
        email: "priyadesai99@example.com",
        phone: "+91 87654 32109",
        webinarsAttended: 1,
        totalSpent: "₹999",
        joinedDate: "05 Feb, 2024",
        avatarColor: "#a855f7",
        timeline: [
            { date: "05 Feb, 2024", event: "Attended Free Webinar" },
            { date: "06 Feb, 2024", event: "Purchased Basic Ticket (₹999)" }
        ]
    },
    {
        id: 3,
        name: "Amit Patel",
        email: "amit.patel@example.com",
        phone: "+91 76543 21098",
        webinarsAttended: 0,
        totalSpent: "₹0",
        joinedDate: "01 Mar, 2024",
        avatarColor: "#10b981",
        timeline: [
            { date: "01 Mar, 2024", event: "Registered for upcoming Free Webinar" }
        ]
    },
    {
        id: 4,
        name: "Neha Gupta",
        email: "neha.g@example.com",
        phone: "+91 65432 10987",
        webinarsAttended: 3,
        totalSpent: "₹4,500",
        joinedDate: "20 Nov, 2023",
        avatarColor: "#f59e0b",
        timeline: [
            { date: "20 Nov, 2023", event: "Attended SEO Masterclass" },
            { date: "22 Nov, 2023", event: "Purchased Advanced SEO (₹2,500)" },
            { date: "15 Jan, 2024", event: "Purchased Elite Bundle (₹2,000)" }
        ]
    }
];

export const webinarsList = [
    {
        id: "w1",
        title: "Marketing Masterclass 2024",
        date: "24 April 2024",
        time: "6:00 PM - 8:00 PM IST",
        status: "Upcoming",
        price: "₹999",
        registrations: 120,
        totalSeats: 150,
        thumbnail: "linear-gradient(135deg, #0f172a, #1e293b)",
        emoji: "🚀"
    },
    {
        id: "w2",
        title: "Complete UI/UX Blueprint",
        date: "10 April 2024",
        time: "5:00 PM - 7:00 PM IST",
        status: "Published",
        price: "Free",
        registrations: 450,
        totalSeats: 500,
        thumbnail: "linear-gradient(135deg, #0f172a, #1e293b)",
        emoji: "🎨"
    },
    {
        id: "w3",
        title: "SEO for Beginners",
        date: "TBD",
        time: "TBD",
        status: "Draft",
        price: "₹499",
        registrations: 0,
        totalSeats: 200,
        thumbnail: "none",
        emoji: "📈"
    }
];

export const revenueChartData = [
    { date: "01 Mar", earnings: 2500, tickets: 5 },
    { date: "05 Mar", earnings: 7500, tickets: 15 },
    { date: "10 Mar", earnings: 4500, tickets: 9 },
    { date: "15 Mar", earnings: 12500, tickets: 25 },
    { date: "20 Mar", earnings: 8000, tickets: 16 },
    { date: "25 Mar", earnings: 22000, tickets: 44 },
    { date: "30 Mar", earnings: 18000, tickets: 36 },
];

export const transactionLedger = [
    { id: "tx1", date: "30 Mar, 04:20 PM", customer: "Aarti Desai", email: "aarti@example.com", webinar: "Complete UI/UX Blueprint", amount: "₹999", status: "Successful" },
    { id: "tx2", date: "29 Mar, 11:15 AM", customer: "Vivek Roy", email: "vivek.r@example.com", webinar: "Marketing Masterclass", amount: "₹1,499", status: "Processing" },
    { id: "tx3", date: "28 Mar, 02:45 PM", customer: "Pooja Mehta", email: "pooja.mehta@example.com", webinar: "Complete UI/UX Blueprint", amount: "₹999", status: "Successful" },
    { id: "tx4", date: "26 Mar, 09:30 AM", customer: "Sanjay Kumar", email: "sanjay.k@example.com", webinar: "SEO for Beginners", amount: "₹499", status: "Refunded" },
];

export const recentPayouts = [
    { id: "p1", date: "10 March 2024", amount: "₹45,000", status: "Settled" },
    { id: "p2", date: "01 March 2024", amount: "₹38,500", status: "Settled" },
];

export const availableIntegrations = [
    { 
        id: "meta-pixel", 
        name: "Meta Pixel", 
        description: "Track your Facebook and Instagram ad conversions.", 
        category: "Analytics", 
        logo: "MT", 
        color: "#0081fb",
        isElite: false
    },
    { 
        id: "mailchimp", 
        name: "Mailchimp", 
        description: "Automate your email marketing and newsletters.", 
        category: "Email Marketing", 
        logo: "MC", 
        color: "#ffe01b",
        isElite: false
    },
    { 
        id: "whatsapp", 
        name: "WhatsApp Business", 
        description: "Send automated messages and updates to students.", 
        category: "Messaging", 
        logo: "WA", 
        color: "#25D366",
        isElite: false
    },
    { 
        id: "zapier", 
        name: "Zapier", 
        description: "Connect Enrollify to 5000+ apps to automate work.", 
        category: "Automation", 
        logo: "ZP", 
        color: "#ff4a00",
        isElite: true
    },
    { 
        id: "google-analytics", 
        name: "Google Analytics 4", 
        description: "Deep dive into your audience behavior and traffic.", 
        category: "Analytics", 
        logo: "GA", 
        color: "#f9ab00",
        isElite: false
    },
    { 
        id: "convertkit", 
        name: "ConvertKit", 
        description: "Grow your audience with a creator marketing platform.", 
        category: "Email Marketing", 
        logo: "CK", 
        color: "#e54d42",
        isElite: true
    }
];

export const activeConnections = [
    { id: "meta-pixel", status: "Connected", lastSync: "2 mins ago" },
    { id: "whatsapp", status: "Connected", lastSync: "1 hour ago" }
];

export const billingHistory = [
    { id: "inv-001", date: "15 March 2026", description: "Enrollify Growth Plan - Monthly", amount: "₹1,499.00", status: "Paid", hasLogo: true },
    { id: "inv-002", date: "15 February 2026", description: "Enrollify Growth Plan - Monthly", amount: "₹1,499.00", status: "Paid", hasLogo: true },
    { id: "inv-003", date: "15 January 2026", description: "Enrollify Growth Plan - Monthly", amount: "₹1,499.00", status: "Paid", hasLogo: true }
];

export const plans = [
    {
        name: "Basic",
        monthlyPrice: 699,
        yearlyPrice: 599 * 12,
        features: ["5 Lite Webinars", "Up to 100 Students", "Basic Analytics", "Standard Support"]
    },
    {
        name: "Growth",
        monthlyPrice: 1499,
        yearlyPrice: 1199 * 12,
        features: ["10 HD Webinars", "Up to 500 Students", "Advanced Analytics", "Priority Support", "Custom Branding"]
    },
    {
        name: "Elite",
        monthlyPrice: 1999,
        yearlyPrice: 1599 * 12,
        features: ["Unlimited Webinars", "Unlimited Students", "Real-time Analytics", "24/7 VIP Support", "API Access", "Zero Fees"]
    }
];
