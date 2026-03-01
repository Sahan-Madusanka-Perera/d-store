import { Truck, Shield, Headphones, Zap, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
    {
        icon: Truck,
        title: "Island-wide Delivery",
        description: "Fast delivery to all provinces. From Colombo to Jaffna.",
        badge: "FREE over LKR 5,000",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Shield,
        title: "100% Authentic",
        description: "Official merchandise from Japan. Premium quality guaranteed.",
        badge: "Verified Products",
        gradient: "from-indigo-500 to-purple-500",
    },
    {
        icon: Headphones,
        title: "Expert Support",
        description: "Get help from anime enthusiasts who understand your passion.",
        badge: "Community Driven",
        gradient: "from-pink-500 to-rose-500",
    },
    {
        icon: Zap,
        title: "New Releases",
        description: "Be first to know about latest drops and limited editions.",
        badge: "Early Access",
        gradient: "from-amber-500 to-orange-500",
    },
];

export function Features() {
    return (
        <section className="py-24 relative bg-secondary/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                        <Star className="h-4 w-4 text-accent fill-accent" />
                        <span className="text-sm font-semibold text-primary">Why Choose Us</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Trusted by Otakus Everywhere
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Experience Sri Lanka's most trusted anime marketplace with premium quality, authentic products, and unmatched service.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="group hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            <CardContent className="p-8 text-center space-y-6">
                                <div className="relative inline-flex mb-2">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                        <feature.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className={`absolute -inset-4 bg-gradient-to-br ${feature.gradient} rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                                </div>

                                <div className="space-y-3">
                                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                                    <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                    <div className="pt-2">
                                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 transition-colors group-hover:bg-primary/10">
                                            {feature.badge}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
