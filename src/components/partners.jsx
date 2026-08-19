import React, { useRef } from "react";
import { Zap } from "lucide-react";
import data from "../data.json";
import usePauseOnHidden from "../hooks/usePauseOnHidden";

const PARTNERS_ROW_1 = data.partners;
const PARTNERS_ROW_2 = [...data.partners].reverse();
const { partnersText } = data;

const repeatPartners = (partners, repeat = 4) =>
    Array.from({ length: repeat }).flatMap(() => partners);

export default function Partners() {
    const marqueeRef = useRef(null);

    usePauseOnHidden(marqueeRef);

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
                            <span>{partnersText.eyebrow}</span>
                            <span className="eyebrow-line" />
                        </div>

                        <h2 className="sec-h partners-heading">
                            {partnersText.headingLine1}
                            <br />
                            <span>{partnersText.headingLine2}</span>
                        </h2>

                        <h3 className="partners-subheading">
                            {partnersText.subheading}
                        </h3>

                        <p
                            className="sec-p partners-description"
                            dangerouslySetInnerHTML={{ __html: partnersText.description1 }}
                        />

                        <div className="partners-locations">
                            {partnersText.locations.map((loc, index) => (
                                <span className="location-item" key={loc.name}>
                                    <img src={loc.flag} alt={`${loc.name} Flag`} className="location-flag-img" />
                                    {loc.name}
                                    {index < partnersText.locations.length - 1 && <span className="location-dot"> · </span>}
                                </span>
                            ))}
                        </div>

                        <p className="sec-p partners-description">
                            {partnersText.description2}
                        </p>

                        <h3 className="partners-final-question">
                            {partnersText.finalQuestion}
                        </h3>
                    </div>

                    {/* Right: YouTube Testimonial Video */}
                    <div className="partners-video">
                        <iframe
                            src={partnersText.videoUrl}
                            title="YouTube testimonial video"
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                </div>

                {/* Companies marquee */}
                <div className="partners-marquee" ref={marqueeRef}>
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
                                        decoding="async"
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
                                        decoding="async"
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