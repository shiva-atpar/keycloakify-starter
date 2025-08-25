import { useEffect, useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { CountryDropdown, type Country } from "../../components/ui/country-dropdown";
// phone utilities can be added later if needed

export default function RequestUserPhoneNumber(props: PageProps<KcContext, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, realm } = kcContext as any;

    // Manage which identifier tab is active so we only submit relevant field
    const [activeIdentifier, setActiveIdentifier] = useState<"phone" | "email" | "username">("phone");
    const [otpRequested, setOtpRequested] = useState(false);
    const [resendSeconds, setResendSeconds] = useState(0);
    const [otp, setOtp] = useState("");

    useEffect(() => {
        if (!otpRequested || resendSeconds <= 0) return;
        const id = setInterval(() => setResendSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
        return () => clearInterval(id);
    }, [otpRequested, resendSeconds]);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            bodyClassName="no-kc-locale no-kc-header no-kc-username"
            displayInfo={false}
            headerNode={
                <div className="text-center text-xl font-semibold">{realm?.displayName ?? "MYREALM"}</div>
            }
        >
            {/* Identifier selector form */}
            <form id="kc-form-login" action={url.loginAction} method="post" className="w-full flex justify-center">
                <div className="w-full max-w-sm flex flex-col gap-6">
                    <Tabs value={activeIdentifier} onValueChange={(v) => setActiveIdentifier(v as typeof activeIdentifier)}>
                        <TabsList>
                            <TabsTrigger value="phone">Phone</TabsTrigger>
                            <TabsTrigger value="email">Email</TabsTrigger>
                            <TabsTrigger value="username">Username</TabsTrigger>
                        </TabsList>
                        <TabsContent value="phone">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Phone</CardTitle>
                                    <CardDescription>Enter your mobile number.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3">
                                    <div className="grid gap-2">
                                        <Label>Country</Label>
                                        <div className="flex items-center gap-2">
                                            <CountryDropdown
                                                slim
                                                defaultValue="IND"
                                                onChange={(country: Country) => {
                                                    const code = country.countryCallingCodes?.[0] ?? "";
                                                    const input = document.getElementById("dialCode") as HTMLInputElement | null;
                                                    if (input) input.value = code;
                                                }}
                                            />
                                            <Input id="dialCode" name="dialCode" className="w-24" placeholder="+91" defaultValue="+91" />
                                            <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="555 555 5555" className="flex-1" disabled={activeIdentifier !== "phone"} />
                                        </div>
                                    </div>
                                    {!otpRequested && (
                                        <div>
                                            <Button
                                                type="button"
                                                className="w-full"
                                                onClick={() => {
                                                    setOtpRequested(true);
                                                    setResendSeconds(30);
                                                }}
                                            >
                                                Send OTP
                                            </Button>
                                        </div>
                                    )}
                                    {otpRequested && (
                                        <div className="grid gap-3">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="otp">Enter OTP</Label>
                                                {resendSeconds > 0 ? (
                                                    <span className="text-xs text-neutral-500">Resend in {resendSeconds}s</span>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="h-6 px-2 text-xs"
                                                        onClick={() => setResendSeconds(30)}
                                                    >
                                                        Resend OTP
                                                    </Button>
                                                )}
                                            </div>
                                            <Input
                                                id="otp"
                                                name="otp"
                                                inputMode="numeric"
                                                pattern="[0-9]{6}"
                                                maxLength={6}
                                                placeholder="000000"
                                                value={otp}
                                                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                            />
                                            <Button type="submit" className="w-full" disabled={otp.length !== 6}>
                                                Verify & Continue
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="email">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Email</CardTitle>
                                    <CardDescription>Enter your email address.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" autoComplete="email" disabled={activeIdentifier !== "email"} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" name="password" type="password" autoComplete="current-password" disabled={activeIdentifier !== "email"} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={activeIdentifier !== "email"}>
                                        Log me in
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="username">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Username</CardTitle>
                                    <CardDescription>Enter your username.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input id="username" name="username" type="text" autoComplete="username" disabled={activeIdentifier !== "username"} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={activeIdentifier !== "username"}>
                                        Log me in
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Identify which input the user selected */}
                    <input type="hidden" name="selectedIdentifierType" value={activeIdentifier} />

                    {/* No global continue button; each tab handles its own primary action */}
                </div>
            </form>
        </Template>
    );
}