export function isHealthyDisease(disease) {
    const name = String(disease || "").toLowerCase();

    return (
        name.includes("healthy") ||
        name.includes("no disease") ||
        name === "healthy plant"
    );
}

export function displayRiskLevel(report) {
    if (isHealthyDisease(report?.disease)) {
        return "Low";
    }

    return report?.riskLevel || "Low";
}
