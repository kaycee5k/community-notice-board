const navbar = document.querySelector(".navbar");

navbar.addEventListener("click", () => {
  navbar.classList.toggle("active");
});

// testimonial section
const testimonials = document.querySelectorAll(".testimonial");
    let index = 0;

    document.getElementById("nextBtn").addEventListener("click", () => {
      testimonials[index].classList.remove("active");
      index = (index + 1) % testimonials.length;
      testimonials[index].classList.add("active");
    });

    document.getElementById("prevBtn").addEventListener("click", () => {
      testimonials[index].classList.remove("active");
      index = (index - 1 + testimonials.length) % testimonials.length;
      testimonials[index].classList.add("active");
    });