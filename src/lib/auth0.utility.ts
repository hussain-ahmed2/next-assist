import axios from "axios";

/**
 * Utility to get an Auth0 Management API access token using client credentials.
 * This allows the app to communicate with Auth0 for management tasks like verifying 
 * connections or managing users via SCIM.
 */
export async function getAuth0ManagementToken(issuer: string, clientId: string, clientSecret: string) {
    try {
        // Ensure issuer is properly formatted for the token endpoint
        const baseUrl = issuer.endsWith("/") ? issuer : `${issuer}/`;
        const tokenUrl = `${baseUrl}oauth/token`;
        const audience = `${baseUrl}api/v2/`;

        const response = await axios.post(tokenUrl, {
            client_id: clientId,
            client_secret: clientSecret,
            audience: audience,
            grant_type: "client_credentials"
        });

        return {
            accessToken: response.data.access_token,
            expiresIn: response.data.expires_in,
            tokenType: response.data.token_type
        };
    } catch (error: any) {
        console.error("Auth0 Token Error:", error.response?.data || error.message);
        throw new Error("Failed to authenticate with Auth0 Management API.");
    }
}
