using MediatR;

namespace Terminal.Backend.Application.Commands.Users.Login;

public sealed record LoginCommand(
    string Email,
    string Password,
    string? TwoFactorCode
) : IRequest<AuthenticatedResponse>;

public sealed record AuthenticatedResponse(
    string? Token,
    string? RefreshToken,
    bool RequiresTwoFactor = false
);