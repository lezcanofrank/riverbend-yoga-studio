"use strict";

const workshops = [
  {
    id: "beginner",
    name: "Yoga Basics for Beginners",
    goal: "Learning yoga basics",
    description: "Learn common poses, breathing cues, and ways to use props in a patient, question-friendly session.",
    formValue: "beginner-workshop"
  },
  {
    id: "mobility",
    name: "Desk Break Mobility",
    goal: "Moving comfortably during a busy workday",
    description: "Practice simple movements that can reduce stiffness and add healthy pauses to a busy workday.",
    formValue: "mobility-workshop"
  },
  {
    id: "rest",
    name: "Rest and Reset",
    goal: "Relaxing and reducing stress",
    description: "Explore supported restorative poses and guided breathing techniques intended to encourage relaxation.",
    formValue: "rest-workshop"
  }
];

const storageKeys = {
  workshopPreference: "riverbendWorkshopPreference"
};

const validationMessages = {
  name: "Please enter your full name using at least two characters.",
  email: "Please enter a valid email address.",
  interest: "Please select a class or event.",
  message: "Please enter a message using at least ten characters."
};

function getWorkshopRecommendation(goalValue) {
  return workshops.find(function (workshop) {
    return workshop.goal === goalValue;
  }) || null;
}

function renderRecommendation(workshop, resultElement) {
  if (!resultElement) {
    return;
  }

  if (!workshop) {
    resultElement.textContent = "";
    return;
  }

  resultElement.textContent =
    "Recommended workshop: " +
    workshop.name +
    ". Why this fits: " +
    workshop.description;
}

function saveWorkshopPreference(workshop, selectedGoal) {
  const preference = {
    selectedGoal: selectedGoal,
    workshopId: workshop.id,
    workshopName: workshop.name,
    formValue: workshop.formValue
  };

  localStorage.setItem(storageKeys.workshopPreference, JSON.stringify(preference));
}

function restoreWorkshopPreference() {
  const rawValue = localStorage.getItem(storageKeys.workshopPreference);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return null;
  }
}

function setFieldError(field, message, errorElement) {
  if (!field || !errorElement) {
    return;
  }

  field.classList.add("field-error");
  errorElement.textContent = message;
  errorElement.classList.add("error-message");

  const describedBy = field.getAttribute("aria-describedby");
  const errorId = errorElement.id;

  if (errorId && (!describedBy || describedBy.indexOf(errorId) === -1)) {
    field.setAttribute(
      "aria-describedby",
      describedBy ? describedBy + " " + errorId : errorId
    );
  }

  field.setAttribute("aria-invalid", "true");
}

function clearFieldError(field, errorElement) {
  if (!field || !errorElement) {
    return;
  }

  field.classList.remove("field-error");
  errorElement.textContent = "";
  field.removeAttribute("aria-invalid");

  const describedBy = field.getAttribute("aria-describedby");
  const errorId = errorElement.id;

  if (describedBy && errorId) {
    const remaining = describedBy
      .split(/\s+/)
      .filter(function (id) {
        return id && id !== errorId;
      })
      .join(" ");

    if (remaining) {
      field.setAttribute("aria-describedby", remaining);
    } else {
      field.removeAttribute("aria-describedby");
    }
  }
}

function validateInterestForm(form) {
  const nameField = form.querySelector("#full-name");
  const emailField = form.querySelector("#email");
  const interestField = form.querySelector("#interest");
  const messageField = form.querySelector("#message");

  const nameError = form.querySelector("#full-name-error");
  const emailError = form.querySelector("#email-error");
  const interestError = form.querySelector("#interest-error");
  const messageError = form.querySelector("#message-error");

  let firstInvalid = null;
  let isValid = true;

  const nameValue = nameField ? nameField.value.trim() : "";
  if (!nameField || nameValue.length < 2) {
    setFieldError(nameField, validationMessages.name, nameError);
    firstInvalid = firstInvalid || nameField;
    isValid = false;
  } else {
    clearFieldError(nameField, nameError);
  }

  const emailValue = emailField ? emailField.value.trim() : "";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailField || !emailPattern.test(emailValue)) {
    setFieldError(emailField, validationMessages.email, emailError);
    firstInvalid = firstInvalid || emailField;
    isValid = false;
  } else {
    clearFieldError(emailField, emailError);
  }

  const interestValue = interestField ? interestField.value : "";
  if (!interestField || interestValue === "") {
    setFieldError(interestField, validationMessages.interest, interestError);
    firstInvalid = firstInvalid || interestField;
    isValid = false;
  } else {
    clearFieldError(interestField, interestError);
  }

  const messageValue = messageField ? messageField.value.trim() : "";
  if (!messageField || messageValue.length < 10) {
    setFieldError(messageField, validationMessages.message, messageError);
    firstInvalid = firstInvalid || messageField;
    isValid = false;
  } else {
    clearFieldError(messageField, messageError);
  }

  return {
    isValid: isValid,
    firstInvalid: firstInvalid
  };
}

function initializeWorkshopFinder() {
  const goalSelect = document.getElementById("workshop-goal");
  const showButton = document.getElementById("show-workshop");
  const saveButton = document.getElementById("save-workshop");
  const resultElement = document.getElementById("workshop-recommendation");
  const statusElement = document.getElementById("workshop-saved-status");
  const interestSelect = document.getElementById("interest");

  if (!goalSelect || !showButton || !saveButton || !resultElement) {
    return;
  }

  let currentWorkshop = null;

  function showSaveButton() {
    saveButton.hidden = false;
  }

  showButton.addEventListener("click", function () {
    const selectedGoal = goalSelect.value;
    currentWorkshop = getWorkshopRecommendation(selectedGoal);

    if (!currentWorkshop) {
      renderRecommendation(null, resultElement);
      resultElement.textContent = "Please select a goal to see a workshop recommendation.";
      saveButton.hidden = true;
      return;
    }

    renderRecommendation(currentWorkshop, resultElement);
    showSaveButton();
  });

  saveButton.addEventListener("click", function () {
    if (!currentWorkshop) {
      return;
    }

    saveWorkshopPreference(currentWorkshop, goalSelect.value);

    if (statusElement) {
      statusElement.textContent = "Your workshop preference has been saved.";
    }

    if (interestSelect) {
      interestSelect.value = currentWorkshop.formValue;
    }
  });

  const savedPreference = restoreWorkshopPreference();

  if (savedPreference) {
    const matchingWorkshop =
      workshops.find(function (workshop) {
        return workshop.id === savedPreference.workshopId;
      }) ||
      workshops.find(function (workshop) {
        return workshop.formValue === savedPreference.formValue;
      });

    if (matchingWorkshop) {
      currentWorkshop = matchingWorkshop;
      goalSelect.value = savedPreference.selectedGoal || matchingWorkshop.goal;
      renderRecommendation(matchingWorkshop, resultElement);
      showSaveButton();

      if (statusElement) {
        statusElement.textContent =
          "Saved choice restored: " + matchingWorkshop.name + ".";
      }

      if (interestSelect) {
        interestSelect.value = matchingWorkshop.formValue;
      }
    }
  }
}

function initializeFormValidation() {
  const form = document.getElementById("interest-form");

  if (!form) {
    return;
  }

  const confirmation = document.getElementById("form-confirmation");
  const nameField = form.querySelector("#full-name");
  const emailField = form.querySelector("#email");
  const interestField = form.querySelector("#interest");
  const messageField = form.querySelector("#message");

  const nameError = form.querySelector("#full-name-error");
  const emailError = form.querySelector("#email-error");
  const interestError = form.querySelector("#interest-error");
  const messageError = form.querySelector("#message-error");

  function revalidateName() {
    if (!nameField || !nameError) {
      return;
    }

    if (nameField.value.trim().length >= 2) {
      clearFieldError(nameField, nameError);
    }
  }

  function revalidateEmail() {
    if (!emailField || !emailError) {
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(emailField.value.trim())) {
      clearFieldError(emailField, emailError);
    }
  }

  function revalidateInterest() {
    if (!interestField || !interestError) {
      return;
    }

    if (interestField.value !== "") {
      clearFieldError(interestField, interestError);
    }
  }

  function revalidateMessage() {
    if (!messageField || !messageError) {
      return;
    }

    if (messageField.value.trim().length >= 10) {
      clearFieldError(messageField, messageError);
    }
  }

  if (nameField) {
    nameField.addEventListener("input", revalidateName);
    nameField.addEventListener("blur", revalidateName);
  }

  if (emailField) {
    emailField.addEventListener("input", revalidateEmail);
    emailField.addEventListener("blur", revalidateEmail);
  }

  if (interestField) {
    interestField.addEventListener("change", revalidateInterest);
    interestField.addEventListener("blur", revalidateInterest);
  }

  if (messageField) {
    messageField.addEventListener("input", revalidateMessage);
    messageField.addEventListener("blur", revalidateMessage);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const result = validateInterestForm(form);

    if (!result.isValid) {
      if (confirmation) {
        confirmation.textContent = "";
        confirmation.hidden = true;
      }

      if (result.firstInvalid) {
        result.firstInvalid.focus();
      }

      return;
    }

    if (confirmation) {
      confirmation.hidden = false;
      confirmation.textContent =
        "Thank you. Your interest request is ready to be sent to Riverbend Yoga Studio.";
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initializeWorkshopFinder();
  initializeFormValidation();
});
