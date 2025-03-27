/**
 * Utility functions for generating and validating security passkeys
 */

/**
 * Generates a random passkey for exam re-entry
 * Format: XXXX-XXXX-XXXX (where X is a letter or number)
 */
export function generateRandomPasskey(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed potentially confusing characters: I, O, 0, 1
  const segments = 3;
  const charsPerSegment = 4;
  
  const generateSegment = () => {
    let segment = '';
    for (let i = 0; i < charsPerSegment; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      segment += characters.charAt(randomIndex);
    }
    return segment;
  };
  
  const passkey = Array(segments)
    .fill(null)
    .map(() => generateSegment())
    .join('-');
    
  return passkey;
}

/**
 * Verifies if a provided passkey matches the one associated with a security violation
 * 
 * @param studentId - The ID of the student attempting to regain access
 * @param examId - The ID of the exam
 * @param providedPasskey - The passkey provided by the student for verification
 * @returns - True if the passkey is valid, false otherwise
 */
export function verifyPasskey(
  studentId: string,
  examId: string,
  providedPasskey: string
): boolean {
  try {
    // Retrieve security violations from localStorage
    const violations = JSON.parse(localStorage.getItem('securityViolations') || '[]');
    
    // Find the most recent violation for this student and exam
    const relevantViolations = violations
      .filter((v: any) => v.studentId === studentId && v.examId === examId)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // If no violations found, the passkey is invalid
    if (relevantViolations.length === 0) {
      return false;
    }
    
    // Check if the provided passkey matches the most recent violation's passkey
    const mostRecentViolation = relevantViolations[0];
    return mostRecentViolation.passkey === providedPasskey;
  } catch (error) {
    console.error('Error verifying passkey:', error);
    return false;
  }
}

/**
 * Clears a security violation after a successful validation
 * 
 * @param studentId - The ID of the student
 * @param examId - The ID of the exam
 * @param passkey - The validated passkey
 * @returns - True if the violation was successfully cleared
 */
export function clearSecurityViolation(
  studentId: string,
  examId: string,
  passkey: string
): boolean {
  try {
    const violations = JSON.parse(localStorage.getItem('securityViolations') || '[]');
    
    // Find the index of the violation to clear
    const violationIndex = violations.findIndex(
      (v: any) => v.studentId === studentId && v.examId === examId && v.passkey === passkey
    );
    
    if (violationIndex === -1) {
      return false;
    }
    
    // Mark the violation as cleared instead of removing it entirely
    // This maintains an audit trail while allowing re-entry
    violations[violationIndex].cleared = true;
    violations[violationIndex].clearedAt = new Date();
    
    // Save the updated violations back to localStorage
    localStorage.setItem('securityViolations', JSON.stringify(violations));
    
    return true;
  } catch (error) {
    console.error('Error clearing security violation:', error);
    return false;
  }
} 