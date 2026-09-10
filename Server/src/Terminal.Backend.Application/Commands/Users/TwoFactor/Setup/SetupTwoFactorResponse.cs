namespace Terminal.Backend.Application.Commands.Users.TwoFactor.Setup;

public sealed record SetupTwoFactorResponse(
    string Secret,
    string OtpAuthUrl);