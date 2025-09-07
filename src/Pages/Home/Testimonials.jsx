import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./Testimonials.css";

const Testimonials = ({testimonials=[]}) => {
  return (
    <section className="testimonials">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <h2 className="section-title display-6">What Our Clients Say</h2>
          <p className="section-subtitle mx-auto w-75">
            Trusted by leading builders, architects, and developers across three
            countries.
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          showThumbs={false}
          showStatus={false}
          infiniteLoop
          autoPlay
          interval={5000}
          transitionTime={600}
        //   emulateTouch
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card p-2 pb-5">
              <div className="card shadow-sm border-0 p-4 mx-auto testimonial-inner-card">
                {/* Rating */}
                <div className="text-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`bi bi-star-fill ${
                        i < testimonial.rating ? "text-warning" : "text-secondary"
                      } mx-1`}
                    ></i>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="blockquote text-center mb-4">
                  <p className="mb-0 fst-italic">
                    “{testimonial.testimonialText}”
                  </p>
                </blockquote>

                {/* Client Info */}
                <div className="text-center">
                  <h5 className="mb-0 fw-semibold">{testimonial.clientName}</h5>
                  <small className="text-muted">
                    {testimonial.clientRole} at {testimonial.clientCompany}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;
