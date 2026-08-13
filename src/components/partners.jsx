import React from "react";
import { Zap } from "lucide-react";
import data from "../data.json";

const PARTNERS_ROW_1 = data.partners;
const PARTNERS_ROW_2 = [...data.partners].reverse();

const repeatPartners = (partners, repeat = 4) =>
    Array.from({ length: repeat }).flatMap(() => partners);

export default function Partners() {
    return (
        <section className="partners-section" id="partners">
            <div className="partners-bg-glow" />

            <div className="partners-inner">
                {/* Top Layout: Text + Video */}
                <div className="partners-top-layout">
                    {/* Left: Header & Description */}
                    <div className="partners-header">
                        <div className="sec-eyebrow partners-eyebrow">
                            <span className="eyebrow-line" />
                            <span className="partners-eyebrow-icon">
                                <Zap size={11} strokeWidth={2.5} />
                            </span>
                            <span>Partners & Clients</span>
                            <span className="eyebrow-line" />
                        </div>

                        <h2 className="sec-h partners-heading">
                            Trusted by teams
                            <br />
                            <span>building what&apos;s next.</span>
                        </h2>

                        <p className="sec-p partners-description">
                            I work with ambitious companies, startups, and teams to build
                            digital products, intelligent systems, and experiences that
                            create real impact.
                        </p>
                    </div>

                    {/* Right: YouTube Testimonial Video */}
                    <div className="partners-video">
                        <iframe
                            src="https://www.youtube.com/embed/8KGhyl4qld0?si=vxnTBjI8AeCjR2EJ"
                            title="YouTube testimonial video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                {/* Companies marquee */}
                <div className="partners-marquee">
                    {/* Row 1 */}
                    <div className="partners-track partners-track-left">
                        {repeatPartners(PARTNERS_ROW_1).map((partner, index) => (
                            <div
                                className="partner-card"
                                key={`partner-row-1-${partner.name}-${index}`}
                            >
                                <div className="partner-logo-wrap">
                                    <img
                                        src={partner.logo}
                                        alt={partner.name}
                                        className="partner-logo"
                                        loading="lazy"
                                        draggable="false"
                                    />
                                </div>

                                <span className="partner-name">{partner.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Row 2 */}
                    <div className="partners-track partners-track-right">
                        {repeatPartners(PARTNERS_ROW_2).map((partner, index) => (
                            <div
                                className="partner-card"
                                key={`partner-row-2-${partner.name}-${index}`}
                            >
                                <div className="partner-logo-wrap">
                                    <img
                                        src={partner.logo}
                                        alt={partner.name}
                                        className="partner-logo"
                                        loading="lazy"
                                        draggable="false"
                                    />
                                </div>

                                <span className="partner-name">{partner.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Edge fades */}
                    <div className="partners-fade partners-fade-left" />
                    <div className="partners-fade partners-fade-right" />
                </div>
            </div>
        </section>
    );
}