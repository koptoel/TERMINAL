using MediatR;
using Terminal.Backend.Core.ValueObjects;

namespace Terminal.Backend.Application.Commands.Users.TwoFactor.Setup;

public sealed record SetupTwoFactorCommand(UserId UserId)
    : IRequest<SetupTwoFactorResponse>;